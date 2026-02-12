import React, { useEffect, useState } from 'react';
import { Store, User } from '../types';
import { api } from '../services/api';
import { Search, MapPin, Phone, Mail, Store as StoreIcon, Plus, Building2 } from 'lucide-react';

interface StoresProps {
  user: User;
}

const Stores: React.FC<StoresProps> = ({ user }) => {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    const fetchStores = async () => {
      try {
        const data = await api.stores.list();
        setStores(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchStores();
  }, [user]);

  const filteredStores = stores.filter(s => 
    s.tradeName.toLowerCase().includes(filter.toLowerCase()) ||
    s.city.toLowerCase().includes(filter.toLowerCase()) ||
    s.cnpj.includes(filter)
  );

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center">
            <StoreIcon className="w-6 h-6 mr-3 text-red-600" />
            Lojas Parceiras
          </h1>
          <p className="text-gray-500 text-sm mt-1">Gerencie a rede de revendedores autorizados.</p>
        </div>
        <button className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 shadow-md shadow-red-200 transition-all">
          <Plus className="w-4 h-4 mr-2" />
          Nova Loja
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-8 flex items-center">
        <div className="relative w-full md:w-96">
          <input 
            type="text" 
            placeholder="Buscar por nome, cidade ou CNPJ..." 
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
        </div>
        <div className="ml-auto text-sm text-gray-400">
           Mostrando {filteredStores.length} de {stores.length} lojas
        </div>
      </div>

      {/* Cards Grid */}
      {loading ? (
         <div className="text-center py-20 text-gray-400">Carregando parceiros...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStores.map((store) => (
            <div key={store.id} className="group bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-lg hover:border-red-100 transition-all duration-300 relative overflow-hidden">
              
              {/* Header Card */}
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center text-gray-700 group-hover:bg-red-50 group-hover:text-red-600 transition-colors">
                  <StoreIcon className="w-6 h-6" />
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${store.active ? 'bg-green-50 text-green-700 border-green-100' : 'bg-gray-50 text-gray-500 border-gray-200'}`}>
                  {store.active ? 'Ativa' : 'Inativa'}
                </span>
              </div>

              {/* Content */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900 leading-tight mb-1">{store.tradeName}</h3>
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-3">{store.cnpj}</p>
                
                <div className="flex items-center text-sm text-gray-600 mb-2">
                  <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                  {store.city}, {store.state}
                </div>
                <div className="flex items-center text-sm text-gray-600 mb-2">
                  <Building2 className="w-4 h-4 mr-2 text-gray-400" />
                  {store.legalName}
                </div>
              </div>

              {/* Footer / Contact */}
              <div className="border-t border-gray-100 pt-4 space-y-2">
                 <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center text-gray-600">
                      <Mail className="w-3.5 h-3.5 mr-2 text-gray-400" />
                      <span className="truncate max-w-[150px]" title={store.contactEmail}>{store.contactEmail}</span>
                    </div>
                 </div>
                 <div className="flex items-center justify-between text-sm">
                    <span className="text-xs text-gray-400">Responsável: {store.contactName}</span>
                 </div>
              </div>

              {/* Stats Overlay on Hover (Optional UX Touch) */}
              <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-red-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
              
              <div className="mt-4 pt-2 flex justify-between items-center">
                 <div className="text-xs font-medium text-gray-500 bg-gray-50 px-2 py-1 rounded">
                    {store.claimsCount} solicitações
                 </div>
                 <button className="text-sm font-medium text-red-600 hover:text-red-800">
                    Gerenciar
                 </button>
              </div>

            </div>
          ))}
        </div>
      )}

      {!loading && filteredStores.length === 0 && (
         <div className="text-center py-20 bg-gray-50 rounded-xl border border-dashed border-gray-300">
            <StoreIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">Nenhuma loja encontrada</h3>
            <p className="text-gray-500">Tente ajustar seus filtros de busca.</p>
         </div>
      )}
    </div>
  );
};

export default Stores;