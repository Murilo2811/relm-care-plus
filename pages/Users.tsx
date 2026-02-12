import React, { useEffect, useState } from 'react';
import { User, Role, Store } from '../types';
import { api } from '../services/api';
import { Search, Plus, User as UserIcon, Shield, Lock, Power, Store as StoreIcon, AlertTriangle, Edit } from 'lucide-react';

interface UsersProps {
  user: User;
}

const Users: React.FC<UsersProps> = ({ user }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: Role.LOJA,
    storeId: '',
    active: true,
    id: '' // added for edit mode
  });
  const [isEditing, setIsEditing] = useState(false);

  // Confirmation State
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [userToToggle, setUserToToggle] = useState<User | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [uData, sData] = await Promise.all([
        api.users.list(),
        api.stores.list()
      ]);
      setUsers(uData);
      setStores(sData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const initiateToggleStatus = (targetUser: User) => {
    setUserToToggle(targetUser);
    setIsConfirmOpen(true);
  };

  const confirmToggleStatus = async () => {
    if (!userToToggle) return;

    try {
      await api.users.toggleStatus(userToToggle.id);
      // Refresh local list
      setUsers(prev => prev.map(u => u.id === userToToggle.id ? { ...u, active: !u.active } : u));
      setIsConfirmOpen(false);
      setUserToToggle(null);
    } catch (e) {
      alert("Erro ao alterar status");
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await api.users.update(newUser.id, {
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          storeId: newUser.role === Role.LOJA ? newUser.storeId : undefined,
          active: newUser.active
        });
      } else {
        await api.users.create({
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          storeId: newUser.role === Role.LOJA ? newUser.storeId : undefined,
          active: true
        });
      }
      setIsModalOpen(false);
      setNewUser({ name: '', email: '', role: Role.LOJA, storeId: '', active: true, id: '' });
      setIsEditing(false);
      fetchData(); // Refresh list
    } catch (e: any) {
      alert(`Erro ao salvar usuário: ${e.message || 'Erro desconhecido'}`);
    }
  };

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(filter.toLowerCase()) ||
    u.email.toLowerCase().includes(filter.toLowerCase())
  );

  const getRoleLabel = (role: Role) => {
    switch (role) {
      case Role.ADMIN_RELM: return 'Administrador';
      case Role.GERENTE_RELM: return 'Gerente';
      case Role.LOJA: return 'Lojista';
      default: return role;
    }
  };

  const getRoleColor = (role: Role) => {
    switch (role) {
      case Role.ADMIN_RELM: return 'bg-purple-100 text-purple-800';
      case Role.GERENTE_RELM: return 'bg-blue-100 text-blue-800';
      case Role.LOJA: return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center">
            <UserIcon className="w-6 h-6 mr-3 text-red-600" />
            Usuários do Sistema
          </h1>
          <p className="text-gray-500 text-sm mt-1">Gerencie acessos e permissões da plataforma.</p>
        </div>
        <button
          onClick={() => {
            setNewUser({ name: '', email: '', role: Role.LOJA, storeId: '', active: true, id: '' });
            setIsEditing(false);
            setIsModalOpen(true);
          }}
          className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 shadow-md shadow-red-200 transition-all"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Usuário
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-t-xl border-b border-gray-100 flex items-center shadow-sm">
        <div className="relative w-full md:w-96">
          <input
            type="text"
            placeholder="Buscar por nome ou email..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-b-xl shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuário</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Função</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Associação</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan={5} className="text-center py-10">Carregando...</td></tr>
            ) : filteredUsers.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold">
                      {u.name.charAt(0)}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{u.name}</div>
                      <div className="text-sm text-gray-500">{u.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleColor(u.role)}`}>
                    {getRoleLabel(u.role)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {u.storeId ? (
                    <div className="flex items-center">
                      <StoreIcon className="w-4 h-4 mr-1 text-gray-400" />
                      {stores.find(s => s.id === u.storeId)?.tradeName || 'Loja Desconhecida'}
                    </div>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${u.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {u.active ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {u.id !== user.id && (
                    <>
                      <button
                        onClick={() => {
                          setNewUser({
                            name: u.name,
                            email: u.email,
                            role: u.role,
                            storeId: u.storeId || '',
                            active: u.active,
                            id: u.id
                          });
                          setIsEditing(true);
                          setIsModalOpen(true);
                        }}
                        className="p-1 rounded hover:bg-gray-100 transition-colors text-blue-600 mr-2"
                        title="Editar Usuário"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => initiateToggleStatus(u)}
                        className={`p-1 rounded hover:bg-gray-100 transition-colors ${u.active ? 'text-green-600' : 'text-red-600'}`}
                        title={u.active ? "Desativar Acesso" : "Ativar Acesso"}
                      >
                        <Power className="w-5 h-5" />
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Confirmation Modal */}
      {isConfirmOpen && userToToggle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden animate-fade-in-up">
            <div className="p-6 text-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-6 h-6 text-yellow-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {userToToggle.active ? 'Desativar Usuário?' : 'Reativar Usuário?'}
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                Você está prestes a {userToToggle.active ? 'bloquear' : 'liberar'} o acesso de <span className="font-semibold text-gray-900">{userToToggle.name}</span>.
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setIsConfirmOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmToggleStatus}
                  className={`px-4 py-2 rounded-lg text-white font-medium ${userToToggle.active ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
                >
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in-up">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-lg font-bold text-gray-900">{isEditing ? 'Editar Usuário' : 'Novo Usuário'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>

            <form onSubmit={handleCreateUser} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
                <input
                  required
                  className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-red-500 focus:border-red-500 px-3 py-2"
                  value={newUser.name}
                  onChange={e => setNewUser({ ...newUser, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  required
                  type="email"
                  className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-red-500 focus:border-red-500 px-3 py-2"
                  value={newUser.email}
                  onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Permissão (Role)</label>
                <div className="grid grid-cols-1 gap-2">
                  <label className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all ${newUser.role === Role.ADMIN_RELM ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}>
                    <input
                      type="radio"
                      name="role"
                      value={Role.ADMIN_RELM}
                      checked={newUser.role === Role.ADMIN_RELM}
                      onChange={() => setNewUser({ ...newUser, role: Role.ADMIN_RELM, storeId: '' })}
                      className="text-red-600 focus:ring-red-500"
                    />
                    <div className="ml-3">
                      <span className="block text-sm font-medium text-gray-900">Administrador</span>
                      <span className="block text-xs text-gray-500">Acesso total ao sistema</span>
                    </div>
                  </label>
                  <label className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all ${newUser.role === Role.LOJA ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}>
                    <input
                      type="radio"
                      name="role"
                      value={Role.LOJA}
                      checked={newUser.role === Role.LOJA}
                      onChange={() => setNewUser({ ...newUser, role: Role.LOJA })}
                      className="text-red-600 focus:ring-red-500"
                    />
                    <div className="ml-3">
                      <span className="block text-sm font-medium text-gray-900">Lojista</span>
                      <span className="block text-xs text-gray-500">Acesso limitado à loja vinculada</span>
                    </div>
                  </label>
                </div>
              </div>

              {newUser.role === Role.LOJA && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vincular Loja</label>
                  <select
                    required
                    className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-red-500 focus:border-red-500 px-3 py-2"
                    value={newUser.storeId}
                    onChange={e => setNewUser({ ...newUser, storeId: e.target.value })}
                  >
                    <option value="">Selecione uma loja...</option>
                    {stores.map(s => (
                      <option key={s.id} value={s.id}>{s.tradeName} ({s.city})</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 shadow-sm"
                >
                  {isEditing ? 'Salvar Alterações' : 'Criar Usuário'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;