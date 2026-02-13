import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Store, User, WarrantyClaim, Role } from '../types';
import { api } from '../services/api';
import { useT } from '../i18n/LanguageContext';
import { ArrowLeft, Save, Building2, User as UserIcon, FileText, Plus, CheckCircle } from 'lucide-react';

interface StoreDetailProps {
    user: User;
}

const StoreDetail: React.FC<StoreDetailProps> = ({ user }) => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { t } = useT();

    const [store, setStore] = useState<Store | null>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [claims, setClaims] = useState<WarrantyClaim[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'claims'>('overview');

    // Form states
    const [formData, setFormData] = useState<Partial<Store>>({});

    useEffect(() => {
        if (id) loadData();
    }, [id]);

    const loadData = async () => {
        setLoading(true);
        try {
            const storeData = await api.stores.getById(id!);
            if (storeData) {
                setStore(storeData);
                setFormData(storeData);

                // Load Users
                const allUsers = await api.users.list();
                setUsers(allUsers.filter(u => u.storeId === id));

                // Load Claims
                const allClaims = await api.claims.list();
                setClaims(allClaims.filter(c => c.storeId === id || c.purchaseStoreName === storeData.tradeName));
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!id || !formData) return;
        setSaving(true);
        try {
            await api.stores.update(id, formData);
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
            loadData(); // Refresh
        } catch (e) {
            console.error(e);
            alert(t.common.submitError);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">{t.common.loading}</div>;
    if (!store) return <div className="p-8 text-center text-gray-500">{t.stores.noStoresFound}</div>;

    return (
        <div className="max-w-6xl mx-auto pb-10">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center">
                    <button onClick={() => navigate('/admin/stores')} className="mr-4 p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-black text-black uppercase italic flex items-center">
                            <Building2 className="w-6 h-6 mr-3 text-black" />
                            {store.tradeName}
                        </h1>
                        <p className="text-gray-400 text-sm mt-1 font-light">{store.cnpj} • {store.city}, {store.state}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest border ${formData.active ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-400 border-gray-200'}`}>
                        {formData.active ? t.stores.active : t.stores.inactive}
                    </span>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center px-6 py-2 bg-black text-white hover:bg-zinc-800 transition-colors text-sm font-bold uppercase tracking-widest disabled:opacity-50"
                    >
                        {saved ? <><CheckCircle className="w-4 h-4 mr-2" /> {t.common.saved}</> : <><Save className="w-4 h-4 mr-2" /> {t.common.save}</>}
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 mb-6">
                {[
                    { id: 'overview', label: t.stores.storeDetails, icon: FileText },
                    { id: 'users', label: t.stores.linkedUsers, icon: UserIcon },
                    { id: 'claims', label: t.stores.linkedClaims, icon: FileText } // Reusing icon for simplicity or add specific
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center px-6 py-3 text-sm font-bold uppercase tracking-widest border-b-2 transition-colors ${activeTab === tab.id ? 'border-black text-black' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                    >
                        <tab.icon className="w-4 h-4 mr-2" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="bg-white shadow-sm border border-gray-100 p-8 min-h-[400px]">

                {/* Overview Tab */}
                {activeTab === 'overview' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <h3 className="text-sm font-black text-black uppercase tracking-widest mb-4 border-b pb-2">{t.stores.editStore}</h3>

                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2">Razão Social</label>
                                <input
                                    className="w-full border-b border-gray-200 focus:border-black outline-none py-2 bg-transparent transition-colors"
                                    value={formData.legalName || ''}
                                    onChange={e => setFormData({ ...formData, legalName: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2">Nome Fantasia</label>
                                <input
                                    className="w-full border-b border-gray-200 focus:border-black outline-none py-2 bg-transparent transition-colors"
                                    value={formData.tradeName || ''}
                                    onChange={e => setFormData({ ...formData, tradeName: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2">{t.form.city}</label>
                                    <input
                                        className="w-full border-b border-gray-200 focus:border-black outline-none py-2 bg-transparent transition-colors"
                                        value={formData.city || ''}
                                        onChange={e => setFormData({ ...formData, city: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2">UF</label>
                                    <input
                                        className="w-full border-b border-gray-200 focus:border-black outline-none py-2 bg-transparent transition-colors"
                                        value={formData.state || ''}
                                        onChange={e => setFormData({ ...formData, state: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-sm font-black text-black uppercase tracking-widest mb-4 border-b pb-2">{t.dashboard.contact}</h3>
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2">{t.stores.contact}</label>
                                <input
                                    className="w-full border-b border-gray-200 focus:border-black outline-none py-2 bg-transparent transition-colors"
                                    value={formData.contactName || ''}
                                    onChange={e => setFormData({ ...formData, contactName: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2">Email</label>
                                <input
                                    className="w-full border-b border-gray-200 focus:border-black outline-none py-2 bg-transparent transition-colors"
                                    type="email"
                                    value={formData.contactEmail || ''}
                                    onChange={e => setFormData({ ...formData, contactEmail: e.target.value })}
                                />
                            </div>
                            <div className="pt-4">
                                <label className="flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.active}
                                        onChange={e => setFormData({ ...formData, active: e.target.checked })}
                                        className="hidden"
                                    />
                                    <div className={`w-5 h-5 border flex items-center justify-center mr-2 transition-colors ${formData.active ? 'bg-black border-black text-white' : 'border-gray-300'}`}>
                                        {formData.active && <CheckCircle className="w-3 h-3" />}
                                    </div>
                                    <span className="text-sm font-bold uppercase tracking-widest">{t.stores.active}</span>
                                </label>
                            </div>
                        </div>
                    </div>
                )}

                {/* Users Tab */}
                {activeTab === 'users' && (
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-sm font-black text-black uppercase tracking-widest">{users.length} {t.users.users}</h3>
                            {/* Placeholder for Add User logic - reusing Users modal would be complex here, keeping simple for now */}
                            {/* <button className="text-xs font-bold uppercase tracking-widest border border-black px-4 py-2 hover:bg-black hover:text-white transition-colors">
                        + {t.stores.addUser}
                    </button> */}
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-sm">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-2 text-left font-black uppercase tracking-widest text-xs text-gray-400">{t.users.name}</th>
                                        <th className="px-4 py-2 text-left font-black uppercase tracking-widest text-xs text-gray-400">{t.users.email}</th>
                                        <th className="px-4 py-2 text-left font-black uppercase tracking-widest text-xs text-gray-400">{t.users.role}</th>
                                        <th className="px-4 py-2 text-left font-black uppercase tracking-widest text-xs text-gray-400">{t.users.status}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {users.map(u => (
                                        <tr key={u.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 font-medium">{u.name}</td>
                                            <td className="px-4 py-3 text-gray-500">{u.email}</td>
                                            <td className="px-4 py-3">
                                                <span className="bg-gray-100 px-2 py-1 text-[10px] font-bold uppercase tracking-widest">{u.role}</span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest ${u.active ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}`}>
                                                    {u.active ? 'Ativo' : 'Inativo'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                    {users.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="text-center py-8 text-gray-400 italic">Nenhum usuário vinculado.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Claims Tab */}
                {activeTab === 'claims' && (
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-sm font-black text-black uppercase tracking-widest">{claims.length} {t.stores.requests}</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-sm">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-2 text-left font-black uppercase tracking-widest text-xs text-gray-400">{t.claimDetail.protocol}</th>
                                        <th className="px-4 py-2 text-left font-black uppercase tracking-widest text-xs text-gray-400">{t.claimDetail.product}</th>
                                        <th className="px-4 py-2 text-left font-black uppercase tracking-widest text-xs text-gray-400">{t.claimDetail.customer}</th>
                                        <th className="px-4 py-2 text-left font-black uppercase tracking-widest text-xs text-gray-400">{t.dashboard.status}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {claims.map(c => (
                                        <tr key={c.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => navigate('/admin/claims/' + c.id)}>
                                            <td className="px-4 py-3 font-bold text-black">{c.protocolNumber}</td>
                                            <td className="px-4 py-3 text-gray-600">{c.productDescription} <span className="text-xs text-gray-400 block">{c.serialNumber}</span></td>
                                            <td className="px-4 py-3 text-gray-600">{c.customerName}</td>
                                            <td className="px-4 py-3">
                                                <span className="bg-black text-white px-2 py-1 text-[10px] font-bold uppercase tracking-widest">{c.status}</span>
                                            </td>
                                        </tr>
                                    ))}
                                    {claims.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="text-center py-8 text-gray-400 italic">Nenhum chamado vinculado.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default StoreDetail;
