import React, { useEffect, useState } from 'react';
import { User, WarrantyClaim, ClaimStatus, Role } from '../types';
import { api } from '../services/api';
import { STATUS_COLORS } from '../constants';
import { Link } from 'react-router-dom';
import { Search, Filter, Download, AlertCircle } from 'lucide-react';
import { useT } from '../i18n/LanguageContext';
import { useStatusLabels } from '../hooks/useStatusLabels';

interface DashboardProps {
  user: User;
}

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const [claims, setClaims] = useState<WarrantyClaim[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const { t } = useT();
  const statusLabels = useStatusLabels();

  useEffect(() => {
    const fetchClaims = async () => {
      try {
        const data = await api.claims.list();
        setClaims(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchClaims();
  }, [user]);

  const [store, setStore] = useState<any>(null);

  useEffect(() => {
    if (user.role === Role.LOJA && user.storeId) {
      api.stores.getById(user.storeId).then(setStore);
    }
  }, [user]);

  const filteredClaims = claims.filter(c =>
    c.protocolNumber.toLowerCase().includes(filter.toLowerCase()) ||
    c.customerName.toLowerCase().includes(filter.toLowerCase()) ||
    c.serialNumber.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-black text-black uppercase italic">{t.dashboard.overview}</h1>
        {user.role !== Role.LOJA && (
          <button className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors text-sm font-bold uppercase tracking-widest">
            <Download className="w-4 h-4 mr-2" />
            {t.dashboard.exportCsv}
          </button>
        )}
      </div>

      {/* Store Info Card (Only for Stores) */}
      {user.role === Role.LOJA && store && (
        <div className="bg-black p-6 text-white mb-8 shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className="bg-white text-black text-[10px] font-black px-2 py-0.5 uppercase tracking-widest">{t.dashboard.partnerStore}</span>
              <span className="text-gray-500 text-sm">#{store.id}</span>
            </div>
            <h2 className="text-3xl font-black italic">{store.tradeName}</h2>
            <div className="text-gray-400 text-sm mt-1 flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
              <span>{store.city} - {store.state}</span>
              <span className="hidden md:inline text-gray-600">•</span>
              <span>CNPJ: {store.cnpj}</span>
            </div>
          </div>
          <div className="mt-4 md:mt-0 text-right">
            <div className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">{t.common.contact}</div>
            <div className="font-medium">{store.contactName}</div>
            <div className="text-sm text-gray-400">{store.contactEmail}</div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 shadow-sm border border-gray-100">
          <h3 className="text-gray-400 text-[10px] font-black uppercase tracking-widest">{t.dashboard.totalRequests}</h3>
          <p className="text-3xl font-black text-black mt-2">{claims.length}</p>
        </div>
        <div className="bg-white p-6 shadow-sm border border-gray-100">
          <h3 className="text-gray-400 text-[10px] font-black uppercase tracking-widest">{t.dashboard.inAnalysis}</h3>
          <p className="text-3xl font-black text-yellow-600 mt-2">
            {claims.filter(c => c.status === ClaimStatus.EM_ANALISE).length}
          </p>
        </div>
        <div className="bg-white p-6 shadow-sm border border-gray-100">
          <h3 className="text-gray-400 text-[10px] font-black uppercase tracking-widest">{t.dashboard.awaitingClient}</h3>
          <p className="text-3xl font-black text-orange-600 mt-2">
            {claims.filter(c => c.status === ClaimStatus.AGUARDANDO_CLIENTE).length}
          </p>
        </div>
        <div className="bg-white p-6 shadow-sm border border-gray-100">
          <h3 className="text-gray-400 text-[10px] font-black uppercase tracking-widest">{t.dashboard.approvedMonth}</h3>
          <p className="text-3xl font-black text-green-600 mt-2">
            {claims.filter(c => c.status === ClaimStatus.APROVADO).length}
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 border-b border-gray-100 flex items-center justify-between">
        <div className="relative w-96">
          <input
            type="text"
            placeholder={t.dashboard.searchPlaceholder}
            className="w-full pl-10 pr-4 py-2 border-b border-gray-200 focus:border-black focus:outline-none rounded-none bg-white"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
          <Search className="w-5 h-5 text-gray-300 absolute left-3 top-2.5" />
        </div>
        <button className="flex items-center px-4 py-2 text-gray-500 hover:bg-gray-50 text-sm font-bold uppercase tracking-widest">
          <Filter className="w-4 h-4 mr-2" /> {t.dashboard.filters}
        </button>
      </div>

      {/* Table */}
      <div className="bg-white shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">{t.dashboard.protocolDate}</th>
              <th className="px-6 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">{t.dashboard.client}</th>
              <th className="px-6 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">{t.dashboard.productSerial}</th>
              <th className="px-6 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">{t.dashboard.store}</th>
              <th className="px-6 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">{t.dashboard.status}</th>
              <th className="px-6 py-3 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">{t.dashboard.actions}</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={6} className="text-center py-10 text-gray-400">{t.common.loading}</td></tr>
            ) : filteredClaims.map((claim) => (
              <tr
                key={claim.id}
                className={`transition-colors ${claim.linkStatus === 'PENDING_REVIEW'
                  ? 'bg-gray-50 hover:bg-gray-100 border-l-4 border-l-black'
                  : 'hover:bg-gray-50 border-l-4 border-l-transparent'
                  }`}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-black">{claim.protocolNumber}</div>
                  <div className="text-sm text-gray-400">{new Date(claim.createdAt).toLocaleDateString()}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-black">{claim.customerName}</div>
                  <div className="text-xs text-gray-400">{claim.customerPhone}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-black">{claim.productDescription}</div>
                  <div className="text-xs text-gray-400 font-mono">{claim.serialNumber}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-black">{claim.purchaseStoreName}</div>
                  {claim.linkStatus === 'PENDING_REVIEW' && (
                    <div className="flex items-center mt-1 text-black">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      <span className="text-[10px] font-black uppercase tracking-wider">{t.dashboard.pendingLink}</span>
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold ${STATUS_COLORS[claim.status]}`}>
                    {statusLabels[claim.status]}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Link to={`/admin/claims/${claim.id}`} className="text-black underline underline-offset-4 decoration-1 hover:text-gray-600">
                    {t.dashboard.details}
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;