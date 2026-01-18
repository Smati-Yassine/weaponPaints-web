import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { pinsApi, itemsApi } from '../services/api';

export default function PinsPage() {
  const [selectedTeam, setSelectedTeam] = useState<2 | 3>(2);
  const [searchTerm, setSearchTerm] = useState('');
  const queryClient = useQueryClient();

  const { data: pinConfig } = useQuery({
    queryKey: ['pins', selectedTeam],
    queryFn: () => pinsApi.get(selectedTeam),
  });

  const { data: pins, isLoading } = useQuery({
    queryKey: ['pins'],
    queryFn: itemsApi.getPins,
  });

  const filteredPins = pins?.filter((pin: any) =>
    pin.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const savePinMutation = useMutation({
    mutationFn: (pinId: number) => pinsApi.update(selectedTeam, pinId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pins', selectedTeam] });
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Pins</h1>
        <p className="text-gray-400">Display your favorite pins per team</p>
      </div>

      <div className="flex gap-2 bg-gray-800 p-2 rounded-lg inline-flex border border-gray-700">
        <button
          onClick={() => setSelectedTeam(2)}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            selectedTeam === 2 ? 'bg-yellow-600 text-white' : 'text-gray-400 hover:text-white'
          }`}
        >
          🟡 Terrorist
        </button>
        <button
          onClick={() => setSelectedTeam(3)}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            selectedTeam === 3 ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
          }`}
        >
          🔵 Counter-Terrorist
        </button>
      </div>

      <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
        <input
          type="text"
          placeholder="Search pins..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
        />
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {filteredPins.map((pin: any) => {
            const isSelected = pinConfig?.pinId === pin.id;
            return (
              <button
                key={pin.id}
                onClick={() => savePinMutation.mutate(pin.id)}
                className={`bg-gray-800 rounded-lg border-2 transition-all hover:scale-105 ${
                  isSelected ? 'border-blue-500 shadow-lg shadow-blue-500/50' : 'border-gray-700 hover:border-gray-600'
                }`}
              >
                <div className="p-4">
                  <div className="aspect-square mb-3 flex items-center justify-center bg-gray-900 rounded-lg overflow-hidden">
                    {pin.imageUrl ? (
                      <img src={pin.imageUrl} alt={pin.name} className="w-full h-full object-contain" loading="lazy" />
                    ) : (
                      <div className="text-4xl">📌</div>
                    )}
                  </div>
                  <h4 className="text-xs font-medium text-white text-center line-clamp-2">{pin.name}</h4>
                  {isSelected && <div className="mt-2 text-xs text-blue-400 font-medium">✓ Selected</div>}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
