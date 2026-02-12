import React, { useEffect, useState } from 'react';
import { User, WarrantyClaim, ClaimStatus, Role } from '../types';
import { api } from '../services/api';
import { STATUS_COLORS, STATUS_LABELS } from '../constants';
import { Link } from 'react-router-dom';
import { Search, Filter, Download, AlertCircle } from 'lucide-react';

interface DashboardProps {
  user: User;
}

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const [claims, setClaims] = useState<WarrantyClaim[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

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

  const filteredClaims = claims.filter(c => 
    c.protocolNumber.toLowerCase().includes(filter.toLowerCase()) ||
    c.customerName.toLowerCase().includes(filter.toLowerCase()) ||
    c.serialNumber.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Visão Geral</h1>
        {user.role !== Role.LOJA && (
             <button className="flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">
                <Download className="w-4 h-4 mr-2" />
                Exportar CSV
             </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-gray-500 text-sm font-medium">Total de Solicitações</h3>
          <p className="text-3xl font-bold text-gray-800 mt-2">{claims.length}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-gray-500 text-sm font-medium">Em Análise</h3>
          <p className="text-3xl font-bold text-yellow-600 mt-2">
            {claims.filter(c => c.status === ClaimStatus.EM_ANALISE).length}
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-gray-500 text-sm font-medium">Aguardando Cliente</h3>
          <p className="text-3xl font-bold text-orange-600 mt-2">
             {claims.filter(c => c.status === ClaimStatus.AGUARDANDO_CLIENTE).length}
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-gray-500 text-sm font-medium">Aprovados (Mês)</h3>
          <p className="text-3xl font-bold text-green-600 mt-2">
             {claims.filter(c => c.status === ClaimStatus.APROVADO).length}
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-t-xl border-b border-gray-100 flex items-center justify-between">
        <div className="relative w-96">
          <input 
            type="text" 
            placeholder="Buscar por protocolo, nome ou serial..." 
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
        </div>
        <button className="flex items-center px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg">
            <Filter className="w-4 h-4 mr-2" /> Filtros Avançados
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-b-xl shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Protocolo / Data</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produto / Serial</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Loja</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
                <tr><td colSpan={6} className="text-center py-10">Carregando...</td></tr>
            ) : filteredClaims.map((claim) => (
              <tr 
                key={claim.id} 
                className={`transition-colors ${
                    claim.linkStatus === 'PENDING_REVIEW' 
                    ? 'bg-red-50 hover:bg-red-100 border-l-4 border-l-red-500' 
                    : 'hover:bg-gray-50 border-l-4 border-l-transparent'
                }`}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{claim.protocolNumber}</div>
                  <div className="text-sm text-gray-500">{new Date(claim.createdAt).toLocaleDateString()}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">{claim.customerName}</div>
                  <div className="text-xs text-gray-500">{claim.customerPhone}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">{claim.productDescription}</div>
                  <div className="text-xs text-gray-500 font-mono">{claim.serialNumber}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">{claim.purchaseStoreName}</div>
                  {claim.linkStatus === 'PENDING_REVIEW' && (
                     <div className="flex items-center mt-1 text-red-700">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        <span className="text-xs font-bold">Vínculo Pendente</span>
                     </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${STATUS_COLORS[claim.status]}`}>
                    {STATUS_LABELS[claim.status]}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Link to={`/admin/claims/${claim.id}`} className="text-red-600 hover:text-red-900">
                    Detalhes
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