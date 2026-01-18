import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { agentsApi, itemsApi } from '../services/api';

export default function AgentsPage() {
  const [selectedTeam, setSelectedTeam] = useState<2 | 3>(2);
  const [searchTerm, setSearchTerm] = useState('');
  const queryClient = useQueryClient();

  const { data: agentsConfig } = useQuery({
    queryKey: ['agents'],
    queryFn: agentsApi.get,
  });

  const { data: agents, isLoading } = useQuery({
    queryKey: ['agents'],
    queryFn: itemsApi.getAgents,
  });

  const filteredAgents = agents?.filter((agent: any) => {
    const matchesTeam = agent.team === selectedTeam;
    const matchesSearch = agent.agent_name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTeam && matchesSearch;
  }) || [];

  const saveAgentMutation = useMutation({
    mutationFn: (model: string) => agentsApi.update(selectedTeam, model),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
    },
  });

  const handleAgentSelect = (agent: any) => {
    saveAgentMutation.mutate(agent.model);
  };

  const currentAgent = selectedTeam === 3 ? agentsConfig?.agentCT : agentsConfig?.agentT;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Agents</h1>
        <p className="text-gray-400">Pick your player models for both teams</p>
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
          placeholder="Search agents..."
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
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredAgents.map((agent: any) => {
            const isSelected = currentAgent === agent.model;
            return (
              <button
                key={agent.model}
                onClick={() => handleAgentSelect(agent)}
                className={`bg-gray-800 rounded-lg border-2 transition-all hover:scale-105 ${
                  isSelected ? 'border-blue-500 shadow-lg shadow-blue-500/50' : 'border-gray-700 hover:border-gray-600'
                }`}
              >
                <div className="p-4">
                  <div className="aspect-[3/4] mb-3 flex items-center justify-center bg-gray-900 rounded-lg overflow-hidden">
                    {agent.image ? (
                      <img src={agent.image} alt={agent.agent_name} className="w-full h-full object-contain" loading="lazy" />
                    ) : (
                      <div className="text-4xl">👤</div>
                    )}
                  </div>
                  <h4 className="text-sm font-medium text-white text-center line-clamp-2">{agent.agent_name}</h4>
                  {isSelected && <div className="mt-2 text-xs text-blue-400 font-medium">✓ Selected</div>}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {filteredAgents.length === 0 && !isLoading && (
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-12 text-center">
          <p className="text-gray-400">No agents found matching "{searchTerm}"</p>
        </div>
      )}
    </div>
  );
}
