import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { weaponsApi, itemsApi } from '../services/api';

export default function WeaponsPage() {
  const [selectedTeam, setSelectedTeam] = useState<2 | 3>(2);
  const [selectedWeapon, setSelectedWeapon] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const queryClient = useQueryClient();

  // Fetch weapons configuration
  const { data: weapons } = useQuery({
    queryKey: ['weapons'],
    queryFn: weaponsApi.getAll,
  });

  // Fetch available skins
  const { data: skins, isLoading: skinsLoading } = useQuery({
    queryKey: ['skins'],
    queryFn: itemsApi.getSkins,
  });

  // Group skins by weapon
  const skinsByWeapon = skins?.reduce((acc: any, skin: any) => {
    const weaponName = skin.weapon_name || 'unknown';
    if (!acc[weaponName]) {
      acc[weaponName] = [];
    }
    acc[weaponName].push(skin);
    return acc;
  }, {}) || {};

  // Get unique weapons
  const weaponsList = Object.keys(skinsByWeapon).sort();

  // Get current weapon's skins
  const currentWeaponSkins = selectedWeapon ? skinsByWeapon[selectedWeapon] || [] : [];

  // Filter skins by search term
  const filteredSkins = currentWeaponSkins.filter((skin: any) =>
    skin.paint_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get user's current selection for this weapon
  const userSelection = weapons?.find(
    (w) => w.weaponTeam === selectedTeam && w.weaponDefindex === currentWeaponSkins[0]?.weapon_defindex
  );

  // Mutation to save skin
  const saveSkinMutation = useMutation({
    mutationFn: (data: any) => weaponsApi.update(selectedTeam, data.defindex, data.config),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weapons'] });
    },
  });

  const handleSkinSelect = (skin: any) => {
    saveSkinMutation.mutate({
      defindex: skin.weapon_defindex,
      config: {
        paintId: parseInt(skin.paint),
        wear: 0.000001,
        seed: 0,
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Weapon Skins</h1>
          <p className="text-gray-400">Select your weapon and choose a skin</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Weapon List Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
            <h3 className="text-lg font-bold text-white mb-4">Weapons</h3>
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {weaponsList.map((weaponName) => (
                <button
                  key={weaponName}
                  onClick={() => {
                    setSelectedWeapon(weaponName);
                    setSearchTerm('');
                  }}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                    selectedWeapon === weaponName
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {weaponName.replace('weapon_', '').toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Skins Grid */}
        <div className="lg:col-span-3">
          {!selectedWeapon ? (
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-12 text-center">
              <div className="text-6xl mb-4">🔫</div>
              <h3 className="text-xl font-bold text-white mb-2">Select a Weapon</h3>
              <p className="text-gray-400">Choose a weapon from the list to see available skins</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
                <input
                  type="text"
                  placeholder="Search skins..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                />
              </div>

              {/* Skins Grid */}
              {skinsLoading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredSkins.map((skin: any) => {
                    const isSelected =
                      userSelection?.paintId === parseInt(skin.paint);

                    return (
                      <button
                        key={`${skin.weapon_defindex}-${skin.paint}`}
                        onClick={() => handleSkinSelect(skin)}
                        className={`bg-gray-800 rounded-lg border-2 transition-all hover:scale-105 ${
                          isSelected
                            ? 'border-blue-500 shadow-lg shadow-blue-500/50'
                            : 'border-gray-700 hover:border-gray-600'
                        }`}
                      >
                        <div className="p-4">
                          <div className="aspect-[4/3] mb-3 flex items-center justify-center bg-gray-900 rounded-lg overflow-hidden">
                            <img
                              src={skin.image}
                              alt={skin.paint_name}
                              className="w-full h-full object-contain"
                              loading="lazy"
                            />
                          </div>
                          <h4 className="text-sm font-medium text-white text-center line-clamp-2">
                            {skin.paint_name}
                          </h4>
                          {isSelected && (
                            <div className="mt-2 text-xs text-blue-400 font-medium">
                              ✓ Selected
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {filteredSkins.length === 0 && !skinsLoading && (
                <div className="bg-gray-800 rounded-lg border border-gray-700 p-12 text-center">
                  <p className="text-gray-400">No skins found matching "{searchTerm}"</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
