import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { glovesApi, itemsApi } from '../services/api';

export default function GlovesPage() {
  const [selectedTeam, setSelectedTeam] = useState<2 | 3>(2);
  const [searchTerm, setSearchTerm] = useState('');
  const queryClient = useQueryClient();

  // Fetch current gloves selection
  const { data: glovesConfig } = useQuery({
    queryKey: ['gloves', selectedTeam],
    queryFn: () => glovesApi.get(selectedTeam),
  });

  // Fetch available gloves
  const { data: gloves, isLoading } = useQuery({
    queryKey: ['gloves'],
    queryFn: itemsApi.getGloves,
  });

  // Filter by search term
  const filteredGloves = gloves?.filter((glove: any) =>
    glove.paint_name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  // Mutation to save gloves
  const saveGlovesMutation = useMutation({
    mutationFn: (defindex: number) => glovesApi.update(selectedTeam, defindex),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gloves', selectedTeam] });
    },
  });

  const handleGlovesSelect = (glove: any) => {
    saveGlovesMutation.mutate(glove.weapon_defindex);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Gloves</h1>
        <p className="text-gray-400">Choose your glove models for T and CT sides</p>
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

      {/* Search Bar */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
        <input
          type="text"
          placeholder="Search gloves..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
        />
      </div>

      {/* Gloves Grid */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredGloves.map((glove: any) => {
            const isSelected = glovesConfig?.defindex === glove.weapon_defindex;

            return (
              <button
                key={`${glove.weapon_defindex}-${glove.paint}`}
                onClick={() => handleGlovesSelect(glove)}
                className={`bg-gray-800 rounded-lg border-2 transition-all hover:scale-105 ${
                  isSelected
                    ? 'border-blue-500 shadow-lg shadow-blue-500/50'
                    : 'border-gray-700 hover:border-gray-600'
                }`}
              >
                <div className="p-4">
                  <div className="aspect-[4/3] mb-3 flex items-center justify-center bg-gray-900 rounded-lg overflow-hidden">
                    {glove.image ? (
                      <img
                        src={glove.image}
                        alt={glove.paint_name}
                        className="w-full h-full object-contain"
                        loading="lazy"
                      />
                    ) : (
                      <div className="text-4xl">🧤</div>
                    )}
                  </div>
                  <h4 className="text-sm font-medium text-white text-center line-clamp-2">
                    {glove.paint_name}
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

      {filteredGloves.length === 0 && !isLoading && (
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-12 text-center">
          <p className="text-gray-400">No gloves found matching "{searchTerm}"</p>
        </div>
      )}
    </div>
  );
}
