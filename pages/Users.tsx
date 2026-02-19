import React, { useEffect, useState } from 'react';
import { User, Role } from '../types';
import { api } from '../services/api';
import { Search, UserPlus, Users as UsersIcon, Edit, Trash2, X } from 'lucide-react';
import { useT } from '../i18n/LanguageContext';

interface UsersProps {
  user: User;
}

const Users: React.FC<UsersProps> = ({ user }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null); // Track if editing
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formRole, setFormRole] = useState<Role>(Role.LOJA);
  const [formPassword, setFormPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { t } = useT();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await api.users.list();
      setUsers(data);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!formName || !formEmail || !formPassword) return;
    setSubmitting(true);
    try {
      if (editingUserId) {
        // Update existing user
        await api.users.update(editingUserId, {
          name: formName,
          email: formEmail,
          role: formRole,
          active: true,
          password: formPassword || undefined // Only send if not empty
        } as any);
      } else {
        // Create new user
        await api.users.create({ name: formName, email: formEmail, role: formRole, active: true } as any);
      }
      setShowModal(false);
      setEditingUserId(null); // Reset editing state
      setFormName('');
      setFormEmail('');
      setFormPassword('');
      loadUsers();
    } catch (e) {
      console.error(e);
    }
    setSubmitting(false);
  };

  const handleEdit = (user: User) => {
    setEditingUserId(user.id);
    setFormName(user.name);
    setFormEmail(user.email);
    setFormRole(user.role);
    setFormPassword(''); // Reset password field (empty = don't change)
    setShowModal(true);
  };

  const handleNewUser = () => {
    setEditingUserId(null);
    setFormName('');
    setFormEmail('');
    setFormRole(Role.LOJA);
    setFormPassword('');
    setShowModal(true);
  };

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(filter.toLowerCase()) ||
    u.email.toLowerCase().includes(filter.toLowerCase())
  );

  const ROLE_LABELS: Record<string, string> = {
    admin_relm: t.users.roleAdmin,
    gerente_relm: t.users.roleManager,
    operador_relm: t.users.roleOperator,
    loja: t.users.roleStore,
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-black text-black uppercase italic flex items-center">
            <UsersIcon className="w-6 h-6 mr-3 text-black" />
            {t.users.usersTitle}
          </h1>
          <p className="text-gray-400 text-sm mt-1 font-light">{t.users.usersDesc}</p>
        </div>
        <button
          onClick={handleNewUser}
          className="flex items-center px-4 py-2 bg-black text-white hover:bg-zinc-800 shadow-lg shadow-gray-200 transition-all text-sm font-bold uppercase tracking-widest"
        >
          <UserPlus className="w-4 h-4 mr-2" /> {t.users.newUser}
        </button>
      </div>

      {/* Filter */}
      <div className="bg-white p-4 shadow-sm border border-gray-100 mb-6 flex items-center">
        <div className="relative w-full md:w-96">
          <input
            type="text"
            placeholder={t.users.searchPlaceholder}
            className="w-full pl-10 pr-4 py-2 border-b border-gray-200 focus:border-black focus:outline-none rounded-none bg-white"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
          <Search className="w-5 h-5 text-gray-300 absolute left-3 top-2.5" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white shadow-sm overflow-hidden border border-gray-100">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">{t.users.name}</th>
              <th className="px-6 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">{t.users.email}</th>
              <th className="px-6 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">{t.users.role}</th>
              <th className="px-6 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">{t.dashboard.status}</th>
              <th className="px-6 py-3 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">{t.dashboard.actions}</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={5} className="text-center py-10 text-gray-400">{t.common.loading}</td></tr>
            ) : filteredUsers.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-black text-white flex items-center justify-center font-black text-sm">{u.name.charAt(0)}</div>
                    <span className="ml-3 text-sm font-medium text-black">{u.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{u.email}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest bg-gray-100 text-black border border-gray-200">
                    {ROLE_LABELS[u.role] || u.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest ${u.active ? 'bg-gray-50 text-black border border-gray-200' : 'bg-gray-100 text-gray-400 border border-gray-200'}`}>
                    {u.active ? t.stores.active : t.stores.inactive}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <button onClick={() => handleEdit(u)} className="text-gray-400 hover:text-black transition-colors mr-3"><Edit className="w-4 h-4" /></button>
                  <button className="text-gray-400 hover:text-red-600 transition-colors"><Trash2 className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-300">
          <div className="bg-white w-full max-w-lg shadow-2xl animate-in fade-in zoom-in duration-300 border border-zinc-200">
            <div className="flex justify-between items-center p-8 border-b border-gray-100">
              <h2 className="text-2xl font-black text-black uppercase italic tracking-tighter">{editingUserId ? t.dashboard.edit : t.users.newUser}</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-black transition-colors p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-8 space-y-8">
              <div className="space-y-6">
                <div className="group">
                  <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 group-focus-within:text-black transition-colors">{t.form.fullName}</label>
                  <input
                    className="w-full border-b-2 border-gray-100 focus:border-black outline-none py-3 text-lg font-medium transition-all bg-transparent placeholder-gray-200"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder={t.users.name}
                  />
                </div>
                <div className="group">
                  <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 group-focus-within:text-black transition-colors">{t.form.email}</label>
                  <input
                    className="w-full border-b-2 border-gray-100 focus:border-black outline-none py-3 text-lg font-medium transition-all bg-transparent placeholder-gray-200"
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder={t.login.emailPlaceholder}
                  />
                </div>
                <div className="group">
                  <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 group-focus-within:text-black transition-colors">{t.login.password}</label>
                  <input
                    className="w-full border-b-2 border-gray-100 focus:border-black outline-none py-3 text-lg font-medium transition-all bg-transparent placeholder-gray-200"
                    type="password"
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    placeholder={editingUserId ? "Deixe vazio para manter a senha" : "••••••••"}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-4">{t.users.accessProfile}</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[
                    { value: Role.ADMIN_RELM, label: t.users.roleAdmin, desc: 'Acesso Total' },
                    { value: Role.GERENTE_RELM, label: t.users.roleManager, desc: 'Gestão' },
                    { value: Role.LOJA, label: t.users.roleStore, desc: 'Operacional' },
                  ].map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setFormRole(opt.value)}
                      className={`relative flex flex-col items-center justify-center p-4 border-2 transition-all duration-200 group ${formRole === opt.value
                        ? 'border-black bg-black text-white shadow-lg scale-[1.02]'
                        : 'border-gray-100 hover:border-black/30 text-gray-600 hover:bg-gray-50'
                        }`}
                    >
                      <div className={`w-3 h-3 rounded-full mb-3 border-2 ${formRole === opt.value ? 'bg-white border-white' : 'border-gray-300 group-hover:border-black'
                        }`} />
                      <span className="text-xs font-black uppercase tracking-wider mb-1">{opt.label}</span>
                      <span className={`text-[10px] uppercase tracking-widest ${formRole === opt.value ? 'text-gray-400' : 'text-gray-300'
                        }`}>{opt.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-8 border-t border-gray-100 flex gap-4 bg-gray-50/50">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-4 px-6 border-2 border-gray-200 text-black hover:bg-white hover:border-black font-black uppercase tracking-[0.2em] text-xs transition-all duration-300"
              >
                {t.common.back}
              </button>
              <button
                onClick={handleSave}
                disabled={submitting}
                className="flex-[2] py-4 px-6 bg-black text-white border-2 border-black hover:bg-zinc-800 hover:border-zinc-800 font-black uppercase tracking-[0.2em] text-xs transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-black/20"
              >
                {submitting ? t.form.processing : (editingUserId ? t.common.save : t.users.create)}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;