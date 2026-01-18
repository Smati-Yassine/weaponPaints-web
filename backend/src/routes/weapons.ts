import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth';
import { requireOwnResource } from '../middleware/authorization';
import { getPool } from '../config/database';
import {
  validateWear,
  validateSeed,
  validateNametag,
  validateStatTrakCounter,
  validateStickers,
  validateTeam,
  validateWeaponDefindex,
  validatePaintId,
  ValidationError,
} from '../utils/validation';
import {
  serializeStickerSlots,
  deserializeStickerSlots,
  serializeKeychain,
  deserializeKeychain,
} from '../utils/serialization';
import { WeaponConfig, PlayerSkin, Sticker, Keychain } from '../types/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

const router = Router();

/**
 * GET /api/player/weapons
 * Get all weapon configurations for authenticated user
 */
router.get('/', requireAuth, requireOwnResource, async (req: Request, res: Response) => {
  try {
    const steamId = req.params.steamId;
    const pool = getPool();

    const [rows] = await pool.query<(PlayerSkin & RowDataPacket)[]>(
      'SELECT * FROM wp_player_skins WHERE steamid = ?',
      [steamId]
    );

    // Transform database rows to API format
    const weapons: WeaponConfig[] = rows.map((row) => ({
      steamid: row.steamid,
      weaponTeam: row.weapon_team,
      weaponDefindex: row.weapon_defindex,
      paintId: row.weapon_paint_id,
      wear: row.weapon_wear,
      seed: row.weapon_seed,
      nametag: row.weapon_nametag,
      stattrak: Boolean(row.weapon_stattrak),
      stattrakCount: row.weapon_stattrak_count,
      stickers: deserializeStickerSlots([
        row.weapon_sticker_0,
        row.weapon_sticker_1,
        row.weapon_sticker_2,
        row.weapon_sticker_3,
        row.weapon_sticker_4,
      ]),
      keychain: deserializeKeychain(row.weapon_keychain),
    }));

    res.json({ weapons });
  } catch (error) {
    console.error('Error fetching weapon configurations:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch weapon configurations',
    });
  }
});

/**
 * PUT /api/player/weapons/:team/:defindex
 * Update or create weapon configuration
 */
router.put('/:team/:defindex', requireAuth, requireOwnResource, async (req: Request, res: Response) => {
  try {
    const steamId = req.params.steamId;
    const team = parseInt(req.params.team);
    const defindex = parseInt(req.params.defindex);

    // Validate team and defindex
    validateTeam(team);
    validateWeaponDefindex(defindex);

    // Extract and validate request body
    const {
      paintId,
      wear = 0.000001,
      seed = 0,
      nametag = null,
      stattrak = false,
      stattrakCount = 0,
      stickers = [],
      keychain = null,
    } = req.body;

    // Validate all fields
    validatePaintId(paintId);
    validateWear(wear);
    validateSeed(seed);
    validateNametag(nametag);
    
    if (stattrak) {
      validateStatTrakCounter(stattrakCount);
    }

    validateStickers(stickers);

    // Serialize stickers and keychain
    const stickerSlots = serializeStickerSlots(stickers);
    const keychainStr = serializeKeychain(keychain);

    const pool = getPool();

    // Insert or update weapon configuration
    await pool.query<ResultSetHeader>(
      `INSERT INTO wp_player_skins 
        (steamid, weapon_team, weapon_defindex, weapon_paint_id, weapon_wear, weapon_seed, 
         weapon_nametag, weapon_stattrak, weapon_stattrak_count, 
         weapon_sticker_0, weapon_sticker_1, weapon_sticker_2, weapon_sticker_3, weapon_sticker_4, 
         weapon_keychain)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         weapon_paint_id = VALUES(weapon_paint_id),
         weapon_wear = VALUES(weapon_wear),
         weapon_seed = VALUES(weapon_seed),
         weapon_nametag = VALUES(weapon_nametag),
         weapon_stattrak = VALUES(weapon_stattrak),
         weapon_stattrak_count = VALUES(weapon_stattrak_count),
         weapon_sticker_0 = VALUES(weapon_sticker_0),
         weapon_sticker_1 = VALUES(weapon_sticker_1),
         weapon_sticker_2 = VALUES(weapon_sticker_2),
         weapon_sticker_3 = VALUES(weapon_sticker_3),
         weapon_sticker_4 = VALUES(weapon_sticker_4),
         weapon_keychain = VALUES(weapon_keychain)`,
      [
        steamId,
        team,
        defindex,
        paintId,
        wear,
        seed,
        nametag,
        stattrak ? 1 : 0,
        stattrakCount,
        ...stickerSlots,
        keychainStr,
      ]
    );

    // Return saved configuration
    const savedConfig: WeaponConfig = {
      steamid: steamId,
      weaponTeam: team as 2 | 3,
      weaponDefindex: defindex,
      paintId,
      wear,
      seed,
      nametag,
      stattrak,
      stattrakCount,
      stickers,
      keychain,
    };

    res.json({
      message: 'Weapon configuration saved successfully',
      weapon: savedConfig,
    });
  } catch (error) {
    if (error instanceof ValidationError) {
      res.status(400).json({
        error: 'Validation error',
        message: error.message,
      });
      return;
    }

    console.error('Error saving weapon configuration:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to save weapon configuration',
    });
  }
});

/**
 * DELETE /api/player/weapons/:team/:defindex
 * Delete weapon configuration
 */
router.delete('/:team/:defindex', requireAuth, requireOwnResource, async (req: Request, res: Response) => {
  try {
    const steamId = req.params.steamId;
    const team = parseInt(req.params.team);
    const defindex = parseInt(req.params.defindex);

    // Validate team and defindex
    validateTeam(team);
    validateWeaponDefindex(defindex);

    const pool = getPool();

    const [result] = await pool.query<ResultSetHeader>(
      'DELETE FROM wp_player_skins WHERE steamid = ? AND weapon_team = ? AND weapon_defindex = ?',
      [steamId, team, defindex]
    );

    if (result.affectedRows === 0) {
      res.status(404).json({
        error: 'Not found',
        message: 'Weapon configuration not found',
      });
      return;
    }

    res.json({
      message: 'Weapon configuration deleted successfully',
    });
  } catch (error) {
    if (error instanceof ValidationError) {
      res.status(400).json({
        error: 'Validation error',
        message: error.message,
      });
      return;
    }

    console.error('Error deleting weapon configuration:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to delete weapon configuration',
    });
  }
});

export default router;
