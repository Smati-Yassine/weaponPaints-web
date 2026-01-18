import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { weaponsApi, itemsApi } from '../services/api';

export default function WeaponsPage() {
  const [selectedTeam, setSelectedTeam] = useState<2 | 3>(2);

  // Fetch weapons configuration
  const { data: weapons, isLoading: weaponsLoading } = useQuery({
    queryKey: ['weapons'],
    queryFn: weaponsApi.getAll,
  });

  // Fetch available skins (for future use)
  const { isLoading: skinsLoading } = useQuery({
    queryKey: ['skins'],
    queryFn: itemsApi.getSkins,
  });

  const isLoading = weaponsLoading || skinsLoading;

  const teamWeapons = weapons?.filter((w) => w.weaponTeam === selectedTeam) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Weapon Skins</h1>
          <p className="text-gray-400">
            Customize your weapon skins with paint, wear, seed, and more
          </p>
        </div>
      </div>

      {/* Team Selector */}
      <div className="flex gap-2 bg-gray-800 p-2 rounded-lg inline-flex border border-gray-700">
        <button
          onClick={() => setSelectedTeam(2)}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            selectedTeam === 2
              ? 'bg-yellow-600 text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          🟡 Terrorist
        </button>
        <button
          onClick={() => setSelectedTeam(3)}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            selectedTeam === 3
              ? 'bg-blue-600 text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          🔵 Counter-Terrorist
        </button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          <p className="text-gray-400 mt-4">Loading weapons...</p>
        </div>
      )}

      {/* Weapons List */}
      {!isLoading && (
        <div className="bg-gray-800 rounded-lg border border-gray-700">
          {teamWeapons.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔫</div>
              <h3 className="text-xl font-bold text-white mb-2">
                No weapons configured
              </h3>
              <p className="text-gray-400 mb-6">
                Start by adding weapon skins for this team
              </p>
              <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
                Add Weapon Skin
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-700">
              {teamWeapons.map((weapon) => (
                <div
                  key={`${weapon.weaponTeam}-${weapon.weaponDefindex}`}
                  className="p-6 hover:bg-gray-750 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-white mb-1">
                        Weapon #{weapon.weaponDefindex}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <span>Paint ID: {weapon.paintId}</span>
                        <span>Wear: {weapon.wear.toFixed(4)}</span>
                        <span>Seed: {weapon.seed}</span>
                        {weapon.stattrak && (
                          <span className="text-orange-400">
                            StatTrak™: {weapon.stattrakCount}
                          </span>
                        )}
                      </div>
                      {weapon.nametag && (
                        <div className="mt-2 text-sm text-blue-400">
                          "{weapon.nametag}"
                        </div>
                      )}
                    </div>
                    <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors">
                      Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Info Box */}
      <div className="bg-blue-900 bg-opacity-30 border border-blue-700 rounded-lg p-4">
        <div className="flex gap-3">
          <div className="text-blue-400 text-xl">ℹ️</div>
          <div>
            <h4 className="text-blue-300 font-medium mb-1">How it works</h4>
            <p className="text-blue-200 text-sm">
              Configure your weapon skins here. Changes will be saved to the database and applied
              when you join the server. Each weapon can have custom paint, wear, seed, nametag,
              StatTrak, stickers, and keychains.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
