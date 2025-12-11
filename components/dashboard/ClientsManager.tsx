import React, { useState } from 'react';
import { Search, User, ChevronRight, Plus, X, Save, MessageCircle } from 'lucide-react';
import { Client } from '../../types';
import { generateId } from '../../utils';

interface ClientsManagerProps {
  onSelectClient: (client: Client) => void;
  clients: Client[];
  onAddClient: (client: Client) => void;
}

export const ClientsManager: React.FC<ClientsManagerProps> = ({
  onSelectClient,
  clients,
  onAddClient,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newClientData, setNewClientData] = useState({
    name: '',
    phone: '',
    notes: '',
  });

  const handleSaveNewClient = () => {
    if (!newClientData.name || !newClientData.phone) {
      alert('Nome e Telefone são obrigatórios!');
      return;
    }

    const newClient: Client = {
      id: generateId(),
      name: newClientData.name,
      phone: newClientData.phone,
      level: 1,
      lastVisit: 'Nunca',
      img: null,
      status: 'new',
      notes: newClientData.notes,
    };

    onAddClient(newClient);
    setIsAddModalOpen(false);
    setNewClientData({ name: '', phone: '', notes: '' });
  };

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full w-full p-4 pb-32 animate-fade-in relative z-10">
      {/* Header Section */}
      <div className="mb-8 mt-2 flex-shrink-0">
        <h1 className="text-4xl font-graffiti text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-gray-700 to-gray-500 dark:from-white dark:via-gray-200 dark:to-gray-500 leading-none drop-shadow-sm dark:drop-shadow-[0_0_10px_rgba(255,255,255,0.1)] mb-2 transition-all">
          CLIENTES
        </h1>
        <div className="w-24 h-1 bg-neon-yellow rounded-full shadow-[0_0_10px_rgba(227,253,0,0.5)]"></div>
        <p className="text-text-secondary text-[10px] font-bold uppercase tracking-[0.4em] mt-3">
          Gerencie sua base de passageiros
        </p>
      </div>

      {/* Search Bar (Glassmorphism) */}
      <div className="relative mb-8 group flex-shrink-0">
        <div className="absolute inset-0 bg-gradient-to-r from-neon-yellow/20 to-transparent rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <div className="relative">
          <Search
            className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-neon-yellow transition-colors"
            size={22}
          />
          <input
            type="text"
            placeholder="BUSCAR PASSAGEIRO..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 rounded-2xl py-5 pl-14 pr-4 text-sm font-bold uppercase tracking-wider focus:outline-none focus:border-neon-yellow/50 focus:bg-white dark:focus:bg-black/40 transition-all shadow-lg dark:shadow-[0_0_30px_rgba(0,0,0,0.3)]"
          />
        </div>
      </div>

      {/* Client List */}
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar min-h-0">
        <div className="flex flex-col gap-4 pb-20">
          {filteredClients.map(client => (
            <div
              key={client.id}
              onClick={() => onSelectClient(client)}
              className="group relative bg-white dark:bg-black/40 backdrop-blur-sm border border-gray-200 dark:border-white/5 p-4 rounded-2xl hover:border-neon-yellow/30 hover:shadow-lg dark:hover:shadow-neon-yellow/10 transition-all duration-300 cursor-pointer overflow-hidden flex-shrink-0"
            >
              {/* Hover Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-neon-yellow/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

              <div className="relative flex items-center justify-between z-10">
                <div className="flex items-center gap-5">
                  {/* Avatar with Neon Ring */}
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-100 dark:border-white/10 group-hover:border-neon-yellow transition-colors shadow-lg">
                      {client.img ? (
                        <img
                          src={client.img}
                          alt={client.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-[#111] text-gray-400 dark:text-gray-600">
                          <User size={28} />
                        </div>
                      )}
                    </div>
                    {/* Status Dot (Mock) */}
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-black shadow-[0_0_5px_rgba(34,197,94,0.8)]"></div>
                  </div>

                  {/* Info */}
                  <div className="flex flex-col">
                    <h3 className="text-xl font-graffiti text-gray-900 dark:text-white leading-none mb-1 group-hover:text-neon-yellow transition-colors">
                      {client.name}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest bg-gray-100 dark:bg-white/5 px-2 py-0.5 rounded-sm">
                        Nível {client.level || 1}
                      </span>
                      {client.lastVisit && (
                        <span className="text-[10px] font-bold text-gray-400 dark:text-gray-600 uppercase tracking-wider">
                          • {client.lastVisit}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Icon */}
                <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-400 dark:text-gray-500 group-hover:bg-neon-yellow group-hover:text-black transition-all transform group-hover:scale-110 shadow-lg">
                  <ChevronRight size={20} />
                </div>
              </div>
            </div>
          ))}

          {/* Empty State */}
          {filteredClients.length === 0 && (
            <div className="flex flex-col items-center justify-center mt-20 opacity-50">
              <User size={64} className="text-gray-300 dark:text-gray-700 mb-4" />
              <p className="text-gray-400 dark:text-gray-500 font-graffiti text-xl">
                Nenhum passageiro encontrado
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Floating Add Button (Neon Pulse) */}
      <button
        onClick={() => setIsAddModalOpen(true)}
        className="fixed bottom-24 right-6 w-16 h-16 bg-neon-yellow rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(227,253,0,0.4)] hover:shadow-[0_0_50px_rgba(227,253,0,0.6)] hover:scale-110 transition-all z-40 text-black animate-pulse-slow"
      >
        <Plus size={32} strokeWidth={3} />
      </button>

      {/* MODAL ADICIONAR CLIENTE */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 dark:bg-black/90 backdrop-blur-md animate-fade-in">
          <div className="bg-white dark:bg-[#111] w-full max-w-md p-8 rounded-sm shadow-[0_0_50px_rgba(0,0,0,0.2)] dark:shadow-[0_0_50px_rgba(0,0,0,0.8)] relative border border-gray-200 dark:border-white/10 transition-colors">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 dark:text-gray-500 dark:hover:text-white transition-colors"
            >
              <X size={24} />
            </button>

            <h2 className="text-3xl font-graffiti text-gray-900 dark:text-white mb-1">
              NOVO PASSAGEIRO
            </h2>
            <div className="w-16 h-1 bg-neon-yellow rounded-full mb-8 shadow-[0_0_10px_rgba(227,253,0,0.5)]"></div>

            <div className="space-y-6">
              <div className="group">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] block mb-2 group-focus-within:text-neon-yellow transition-colors">
                  Nome do Cliente
                </label>
                <input
                  type="text"
                  value={newClientData.name}
                  onChange={e => setNewClientData({ ...newClientData, name: e.target.value })}
                  className="w-full bg-gray-50 dark:bg-black border-b-2 border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white py-3 text-lg font-bold focus:outline-none focus:border-neon-yellow transition-colors placeholder-gray-400 dark:placeholder-gray-800"
                  placeholder="DIGITE O NOME..."
                />
              </div>
              <div className="group">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] block mb-2 group-focus-within:text-neon-yellow transition-colors">
                  Telefone / WhatsApp
                </label>
                <input
                  type="text"
                  value={newClientData.phone}
                  onChange={e => setNewClientData({ ...newClientData, phone: e.target.value })}
                  className="w-full bg-gray-50 dark:bg-black border-b-2 border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white py-3 text-lg font-bold focus:outline-none focus:border-neon-yellow transition-colors placeholder-gray-400 dark:placeholder-gray-800"
                  placeholder="(00) 00000-0000"
                />
              </div>
              <div className="group">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] block mb-2 group-focus-within:text-neon-yellow transition-colors">
                  Notas Iniciais
                </label>
                <textarea
                  value={newClientData.notes}
                  onChange={e => setNewClientData({ ...newClientData, notes: e.target.value })}
                  className="w-full bg-gray-50 dark:bg-black border-2 border-gray-200 dark:border-gray-800 rounded-sm p-4 text-gray-900 dark:text-white focus:outline-none focus:border-neon-yellow transition-colors h-24 resize-none text-sm font-medium"
                  placeholder="Preferências de corte, estilo, etc..."
                />
              </div>

              <button
                onClick={handleSaveNewClient}
                className="w-full bg-neon-yellow hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black text-black font-black text-lg py-4 rounded-sm transition-all flex justify-center items-center gap-3 mt-4 shadow-[0_0_20px_rgba(227,253,0,0.2)] hover:shadow-[0_0_30px_rgba(227,253,0,0.4)] uppercase tracking-widest"
              >
                <Save size={20} /> Cadastrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
