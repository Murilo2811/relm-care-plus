import React, { useEffect, useState } from 'react';
import { Store, User } from '../types';
import { api } from '../services/api';
import { Search, MapPin, Mail, Store as StoreIcon, Plus, Building2 } from 'lucide-react';
import { useT } from '../i18n/LanguageContext';

interface StoresProps {
  user: User;
}

import { useNavigate } from 'react-router-dom';

const Stores: React.FC<StoresProps> = ({ user }) => {
  const navigate = useNavigate();
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const { t } = useT();

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
          <h1 className="text-2xl font-black text-black uppercase italic flex items-center">
            <StoreIcon className="w-6 h-6 mr-3 text-black" />
            {t.stores.partnerStores}
          </h1>
          <p className="text-gray-400 text-sm mt-1 font-light">{t.stores.manageNetwork}</p>
        </div>
        <button className="flex items-center px-4 py-2 bg-black text-white hover:bg-zinc-800 shadow-lg shadow-gray-200 transition-all text-sm font-bold uppercase tracking-widest">
          <Plus className="w-4 h-4 mr-2" />
          {t.stores.newStore}
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 shadow-sm border border-gray-100 mb-8 flex items-center">
        <div className="relative w-full md:w-96">
          <input
            type="text"
            placeholder={t.stores.searchPlaceholder}
            className="w-full pl-10 pr-4 py-2 border-b border-gray-200 focus:border-black focus:outline-none transition-all rounded-none bg-white"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
          <Search className="w-5 h-5 text-gray-300 absolute left-3 top-2.5" />
        </div>
        <div className="ml-auto text-[10px] font-bold uppercase tracking-widest text-gray-400">
          {t.stores.showing} {filteredStores.length} {t.stores.of} {stores.length}
        </div>
      </div>

      {/* Cards Grid */}
      {loading ? (
        <div className="text-center py-20 text-gray-400">{t.common.loading}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStores.map((store) => (
            <div key={store.id} className="group bg-white shadow-sm border border-gray-100 p-6 hover:shadow-lg hover:border-gray-300 transition-all duration-300 relative overflow-hidden">

              {/* Header Card */}
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-gray-50 flex items-center justify-center text-gray-700 group-hover:bg-black group-hover:text-white transition-colors">
                  <StoreIcon className="w-6 h-6" />
                </div>
                <span className={`px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest border ${store.active ? 'bg-gray-50 text-black border-gray-200' : 'bg-gray-50 text-gray-400 border-gray-200'}`}>
                  {store.active ? t.stores.active : t.stores.inactive}
                </span>
              </div>

              {/* Content */}
              <div className="mb-6">
                <h3 className="text-lg font-black text-black leading-tight mb-1">{store.tradeName}</h3>
                <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-3">{store.cnpj}</p>

                <div className="flex items-center text-sm text-gray-600 mb-2">
                  <MapPin className="w-4 h-4 mr-2 text-gray-300" />
                  {store.city}, {store.state}
                </div>
                <div className="flex items-center text-sm text-gray-600 mb-2">
                  <Building2 className="w-4 h-4 mr-2 text-gray-300" />
                  {store.legalName}
                </div>
              </div>

              {/* Footer / Contact */}
              <div className="border-t border-gray-100 pt-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center text-gray-600">
                    <Mail className="w-3.5 h-3.5 mr-2 text-gray-300" />
                    <span className="truncate max-w-[150px]" title={store.contactEmail}>{store.contactEmail}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-xs text-gray-400">{t.stores.contact}: {store.contactName}</span>
                </div>
              </div>

              {/* Bottom accent line on hover */}
              <div className="absolute bottom-0 left-0 w-full h-1 bg-black transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>

              <div className="mt-4 pt-2 flex justify-between items-center">
                <div className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-1 uppercase tracking-widest">
                  {store.claimsCount} {t.stores.requests}
                </div>
                <button
                  onClick={() => navigate(`/admin/stores/${store.id}`)}
                  className="text-sm font-bold text-black hover:text-gray-600 uppercase tracking-widest underline underline-offset-4 decoration-1"
                >
                  {t.stores.manage}
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

      {!loading && filteredStores.length === 0 && (
        <div className="text-center py-20 bg-gray-50 border border-dashed border-gray-300">
          <StoreIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-black text-black uppercase">{t.stores.noStoresFound}</h3>
          <p className="text-gray-400 font-light">{t.stores.tryAdjustingFilters}</p>
        </div>
      )}
    </div>
  );
};

export default Stores;