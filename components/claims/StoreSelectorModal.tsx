
import React, { useState, useEffect } from 'react';
import { X, Search, Store as StoreIcon } from 'lucide-react';
import { api } from '../../services/api';
import { Store } from '../../types';
import { useT } from '../../i18n/LanguageContext';

interface StoreSelectorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (store: Store) => void;
    currentStoreId?: string;
}

export const StoreSelectorModal: React.FC<StoreSelectorModalProps> = ({ isOpen, onClose, onSelect, currentStoreId }) => {
    const [stores, setStores] = useState<Store[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const { t } = useT();

    useEffect(() => {
        if (isOpen) {
            loadStores();
        }
    }, [isOpen]);

    const loadStores = async () => {
        setLoading(true);
        try {
            const data = await api.stores.list();
            setStores(data.filter(s => s.active));
        } catch (error) {
            console.error('Failed to load stores', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredStores = stores.filter(store =>
        store.tradeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        store.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        store.cnpj.includes(searchTerm)
    );

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100">

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <h2 className="text-lg font-black uppercase tracking-widest flex items-center">
                        <StoreIcon className="w-5 h-5 mr-3" />
                        {t.admin.selectStore || 'Select Store'}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-black transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Search */}
                <div className="p-4 border-b border-gray-100 bg-gray-50">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder={t.admin.searchStorePlaceholder || 'Search by name, city or CNPJ...'}
                            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 focus:border-black outline-none text-sm transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            autoFocus
                        />
                    </div>
                </div>

                {/* List */}
                <div className="max-h-[60vh] overflow-y-auto">
                    {loading ? (
                        <div className="p-8 text-center text-gray-400 animate-pulse">Loading stores...</div>
                    ) : filteredStores.length === 0 ? (
                        <div className="p-8 text-center text-gray-400">
                            {t.admin.noStoresFound || 'No stores found.'}
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-50">
                            {filteredStores.map(store => (
                                <button
                                    key={store.id}
                                    onClick={() => onSelect(store)}
                                    className={`w-full text-left p-4 hover:bg-gray-50 transition-colors flex items-center justify-between group ${currentStoreId === store.id ? 'bg-gray-50' : ''}`}
                                >
                                    <div>
                                        <div className="font-bold text-sm text-gray-900 group-hover:text-black transition-colors">
                                            {store.tradeName}
                                        </div>
                                        <div className="text-xs text-gray-500 mt-1">
                                            {store.city} - {store.state} • {store.cnpj}
                                        </div>
                                    </div>
                                    {currentStoreId === store.id && (
                                        <div className="text-[10px] uppercase font-black tracking-widest bg-black text-white px-2 py-1">
                                            Selected
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
