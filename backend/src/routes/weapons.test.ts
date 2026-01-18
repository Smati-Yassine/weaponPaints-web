// Feature: cs2-weaponpaints-web-interface, Property 5: Weapon Configuration Persistence
// Feature: cs2-weaponpaints-web-interface, Property 15: StatTrak Configuration Persistence
// Feature: cs2-weaponpaints-web-interface, Property 18: Nametag Round-Trip
// Feature: cs2-weaponpaints-web-interface, Property 21: Complete Weapon Configuration Persistence

import request from 'supertest';
import * as fc from 'fast-check';
import app from '../index';
import { getPool } from '../config/database';
import { Sticker, Keychain } from '../types/database';

// Mock authentication
jest.mock('../middleware/auth', () => ({
  requireAuth: (req: any, res: any, next: any) => {
    req.user = { steamId: '76561198001234567' };
    req.isAuthenticated = () => true;
    next();
  },
  getSteamId: () => '76561198001234567',
}));

jest.mock('../middleware/authorization', () => ({
  requireOwnResource: (req: any, res: any, next: any) => {
    req.params.steamId = '76561198001234567';
    next();
  },
}));

describe('Weapon Configuration API', () => {
  const testSteamId = '76561198001234567';

  beforeEach(async () => {
    // Clean up test data
    const pool = getPool();
    await pool.query('DELETE FROM wp_player_skins WHERE steamid = ?', [testSteamId]);
  });

  afterAll(async () => {
    // Clean up and close connections
    const pool = getPool();
    await pool.query('DELETE FROM wp_player_skins WHERE steamid = ?', [testSteamId]);
    await pool.end();
  });

  describe('GET /api/player/weapons', () => {
    it('should return empty array when no weapons configured', async () => {
      const response = await request(app)
        .get('/api/player/weapons')
        .expect(200);

      expect(response.body).toEqual({ weapons: [] });
    });

    it('should return all weapon configurations for user', async () => {
      // Insert test data
      const pool = getPool();
      await pool.query(
        `INSERT INTO wp_player_skins 
          (steamid, weapon_team, weapon_defindex, weapon_paint_id, weapon_wear, weapon_seed,
           weapon_nametag, weapon_stattrak, weapon_stattrak_count,
           weapon_sticker_0, weapon_sticker_1, weapon_sticker_2, weapon_sticker_3, weapon_sticker_4,
           weapon_keychain)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          testSteamId,
          2,
          7,
          38,
          0.15,
          123,
          'Test Gun',
          1,
          50,
          '1;0;0.5;0.5;0;1;0',
          '0;0;0;0;0;0;0',
          '0;0;0;0;0;0;0',
          '0;0;0;0;0;0;0',
          '0;0;0;0;0;0;0',
          '1;0;0;0;100',
        ]
      );

      const response = await request(app)
        .get('/api/player/weapons')
        .expect(200);

      expect(response.body.weapons).toHaveLength(1);
      expect(response.body.weapons[0]).toMatchObject({
        steamid: testSteamId,
        weaponTeam: 2,
        weaponDefindex: 7,
        paintId: 38,
        wear: 0.15,
        seed: 123,
        nametag: 'Test Gun',
        stattrak: true,
        stattrakCount: 50,
      });
      expect(response.body.weapons[0].stickers).toHaveLength(1);
      expect(response.body.weapons[0].keychain).toBeTruthy();
    });
  });

  describe('PUT /api/player/weapons/:team/:defindex', () => {
    it('should create new weapon configuration', async () => {
      const weaponConfig = {
        paintId: 38,
        wear: 0.25,
        seed: 500,
        nametag: 'My AK',
        stattrak: true,
        stattrakCount: 100,
        stickers: [],
        keychain: null,
      };

      const response = await request(app)
        .put('/api/player/weapons/2/7')
        .send(weaponConfig)
        .expect(200);

      expect(response.body.message).toBe('Weapon configuration saved successfully');
      expect(response.body.weapon).toMatchObject(weaponConfig);

      // Verify in database
      const pool = getPool();
      const [rows]: any = await pool.query(
        'SELECT * FROM wp_player_skins WHERE steamid = ? AND weapon_team = ? AND weapon_defindex = ?',
        [testSteamId, 2, 7]
      );

      expect(rows).toHaveLength(1);
      expect(rows[0].weapon_paint_id).toBe(38);
      expect(rows[0].weapon_nametag).toBe('My AK');
    });

    it('should update existing weapon configuration', async () => {
      // Create initial config
      await request(app)
        .put('/api/player/weapons/2/7')
        .send({
          paintId: 38,
          wear: 0.25,
          seed: 500,
        })
        .expect(200);

      // Update config
      const updatedConfig = {
        paintId: 44,
        wear: 0.5,
        seed: 750,
        nametag: 'Updated',
      };

      const response = await request(app)
        .put('/api/player/weapons/2/7')
        .send(updatedConfig)
        .expect(200);

      expect(response.body.weapon.paintId).toBe(44);
      expect(response.body.weapon.nametag).toBe('Updated');
    });

    it('should validate wear value', async () => {
      const response = await request(app)
        .put('/api/player/weapons/2/7')
        .send({
          paintId: 38,
          wear: 1.5, // Invalid
        })
        .expect(400);

      expect(response.body.error).toBe('Validation error');
    });

    it('should validate seed value', async () => {
      const response = await request(app)
        .put('/api/player/weapons/2/7')
        .send({
          paintId: 38,
          seed: 1500, // Invalid
        })
        .expect(400);

      expect(response.body.error).toBe('Validation error');
    });

    it('should validate team value', async () => {
      const response = await request(app)
        .put('/api/player/weapons/5/7') // Invalid team
        .send({
          paintId: 38,
        })
        .expect(400);

      expect(response.body.error).toBe('Validation error');
    });

    it('should save weapon with stickers', async () => {
      const stickers: Sticker[] = [
        { id: 1, schema: 0, x: 0.5, y: 0.5, wear: 0, scale: 1, rotation: 0 },
        { id: 2, schema: 0, x: 0.3, y: 0.7, wear: 0.1, scale: 1.2, rotation: 45 },
      ];

      const response = await request(app)
        .put('/api/player/weapons/2/7')
        .send({
          paintId: 38,
          stickers,
        })
        .expect(200);

      expect(response.body.weapon.stickers).toHaveLength(2);
      expect(response.body.weapon.stickers[0]).toMatchObject(stickers[0]);
    });

    it('should reject more than 5 stickers', async () => {
      const stickers: Sticker[] = Array(6).fill({
        id: 1,
        schema: 0,
        x: 0.5,
        y: 0.5,
        wear: 0,
        scale: 1,
        rotation: 0,
      });

      const response = await request(app)
        .put('/api/player/weapons/2/7')
        .send({
          paintId: 38,
          stickers,
        })
        .expect(400);

      expect(response.body.error).toBe('Validation error');
      expect(response.body.message).toContain('Maximum 5 stickers');
    });

    it('should save weapon with keychain', async () => {
      const keychain: Keychain = {
        id: 1,
        x: 0,
        y: 0,
        z: 0,
        seed: 100,
      };

      const response = await request(app)
        .put('/api/player/weapons/2/7')
        .send({
          paintId: 38,
          keychain,
        })
        .expect(200);

      expect(response.body.weapon.keychain).toMatchObject(keychain);
    });
  });

  describe('DELETE /api/player/weapons/:team/:defindex', () => {
    it('should delete weapon configuration', async () => {
      // Create config
      await request(app)
        .put('/api/player/weapons/2/7')
        .send({ paintId: 38 })
        .expect(200);

      // Delete config
      const response = await request(app)
        .delete('/api/player/weapons/2/7')
        .expect(200);

      expect(response.body.message).toBe('Weapon configuration deleted successfully');

      // Verify deleted
      const getResponse = await request(app)
        .get('/api/player/weapons')
        .expect(200);

      expect(getResponse.body.weapons).toHaveLength(0);
    });

    it('should return 404 for non-existent weapon', async () => {
      const response = await request(app)
        .delete('/api/player/weapons/2/7')
        .expect(404);

      expect(response.body.error).toBe('Not found');
    });
  });

  // Property-based tests
  describe('Property Tests', () => {
    it('Property 5: Weapon Configuration Persistence - saved config can be retrieved', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 0, max: 10000 }), // paintId
          fc.double({ min: 0.0, max: 1.0 }), // wear
          fc.integer({ min: 0, max: 1000 }), // seed
          fc.constantFrom(2, 3), // team
          fc.integer({ min: 1, max: 100 }), // defindex
          async (paintId, wear, seed, team, defindex) => {
            // Save configuration
            await request(app)
              .put(`/api/player/weapons/${team}/${defindex}`)
              .send({ paintId, wear, seed })
              .expect(200);

            // Retrieve configuration
            const response = await request(app)
              .get('/api/player/weapons')
              .expect(200);

            const weapon = response.body.weapons.find(
              (w: any) => w.weaponTeam === team && w.weaponDefindex === defindex
            );

            expect(weapon).toBeDefined();
            expect(weapon.paintId).toBe(paintId);
            expect(weapon.wear).toBeCloseTo(wear, 5);
            expect(weapon.seed).toBe(seed);

            // Cleanup
            await request(app)
              .delete(`/api/player/weapons/${team}/${defindex}`)
              .expect(200);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('Property 15: StatTrak Configuration Persistence', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.boolean(), // stattrak enabled
          fc.integer({ min: 0, max: 999999 }), // stattrak count
          async (stattrak, stattrakCount) => {
            const team = 2;
            const defindex = 7;

            // Save configuration
            await request(app)
              .put(`/api/player/weapons/${team}/${defindex}`)
              .send({
                paintId: 38,
                stattrak,
                stattrakCount: stattrak ? stattrakCount : 0,
              })
              .expect(200);

            // Retrieve configuration
            const response = await request(app)
              .get('/api/player/weapons')
              .expect(200);

            const weapon = response.body.weapons.find(
              (w: any) => w.weaponTeam === team && w.weaponDefindex === defindex
            );

            expect(weapon.stattrak).toBe(stattrak);
            if (stattrak) {
              expect(weapon.stattrakCount).toBe(stattrakCount);
            }

            // Cleanup
            await request(app)
              .delete(`/api/player/weapons/${team}/${defindex}`)
              .expect(200);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('Property 18: Nametag Round-Trip', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 128 }).filter((s) => /^[a-zA-Z0-9\s\-_!@#$%^&*()\[\]{}+=|\\:;"'<>,.?/~`]*$/.test(s)),
          async (nametag) => {
            const team = 2;
            const defindex = 7;

            // Save configuration with nametag
            await request(app)
              .put(`/api/player/weapons/${team}/${defindex}`)
              .send({
                paintId: 38,
                nametag,
              })
              .expect(200);

            // Retrieve configuration
            const response = await request(app)
              .get('/api/player/weapons')
              .expect(200);

            const weapon = response.body.weapons.find(
              (w: any) => w.weaponTeam === team && w.weaponDefindex === defindex
            );

            expect(weapon.nametag).toBe(nametag);

            // Cleanup
            await request(app)
              .delete(`/api/player/weapons/${team}/${defindex}`)
              .expect(200);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('Property 21: Complete Weapon Configuration Persistence', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 0, max: 10000 }), // paintId
          fc.double({ min: 0.0, max: 1.0 }), // wear
          fc.integer({ min: 0, max: 1000 }), // seed
          fc.option(fc.string({ minLength: 1, maxLength: 50 }), { nil: null }), // nametag
          fc.boolean(), // stattrak
          fc.integer({ min: 0, max: 999999 }), // stattrakCount
          fc.array(
            fc.record({
              id: fc.integer({ min: 1, max: 1000 }),
              schema: fc.integer({ min: 0, max: 10 }),
              x: fc.double({ min: 0, max: 1 }),
              y: fc.double({ min: 0, max: 1 }),
              wear: fc.double({ min: 0, max: 1 }),
              scale: fc.double({ min: 0.1, max: 5 }),
              rotation: fc.double({ min: 0, max: 360 }),
            }),
            { maxLength: 5 }
          ), // stickers
          async (paintId, wear, seed, nametag, stattrak, stattrakCount, stickers) => {
            const team = 2;
            const defindex = 7;

            // Save complete configuration
            await request(app)
              .put(`/api/player/weapons/${team}/${defindex}`)
              .send({
                paintId,
                wear,
                seed,
                nametag,
                stattrak,
                stattrakCount: stattrak ? stattrakCount : 0,
                stickers,
              })
              .expect(200);

            // Retrieve configuration
            const response = await request(app)
              .get('/api/player/weapons')
              .expect(200);

            const weapon = response.body.weapons.find(
              (w: any) => w.weaponTeam === team && w.weaponDefindex === defindex
            );

            expect(weapon).toBeDefined();
            expect(weapon.paintId).toBe(paintId);
            expect(weapon.wear).toBeCloseTo(wear, 5);
            expect(weapon.seed).toBe(seed);
            expect(weapon.nametag).toBe(nametag);
            expect(weapon.stattrak).toBe(stattrak);
            expect(weapon.stickers).toHaveLength(stickers.length);

            // Cleanup
            await request(app)
              .delete(`/api/player/weapons/${team}/${defindex}`)
              .expect(200);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
