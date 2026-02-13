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

  const handleCreate = async () => {
    if (!formName || !formEmail || !formPassword) return;
    setSubmitting(true);
    try {
      await api.users.create({ name: formName, email: formEmail, role: formRole, active: true } as any);
      setShowModal(false);
      setFormName('');
      setFormEmail('');
      setFormPassword('');
      loadUsers();
    } catch (e) {
      console.error(e);
    }
    setSubmitting(false);
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
          onClick={() => setShowModal(true)}
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
                  <button className="text-gray-400 hover:text-black transition-colors mr-3"><Edit className="w-4 h-4" /></button>
                  <button className="text-gray-400 hover:text-red-600 transition-colors"><Trash2 className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-lg shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-lg font-black text-black uppercase italic">{t.users.newUser}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-black"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2">{t.form.fullName}</label>
                <input className="w-full border-b border-gray-200 focus:border-black outline-none py-2 rounded-none" value={formName} onChange={(e) => setFormName(e.target.value)} />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2">{t.form.email}</label>
                <input className="w-full border-b border-gray-200 focus:border-black outline-none py-2 rounded-none" type="email" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2">{t.login.password}</label>
                <input className="w-full border-b border-gray-200 focus:border-black outline-none py-2 rounded-none" type="password" value={formPassword} onChange={(e) => setFormPassword(e.target.value)} />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-4">{t.users.accessProfile}</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: Role.ADMIN_RELM, label: t.users.roleAdmin },
                    { value: Role.GERENTE_RELM, label: t.users.roleManager },
                    { value: Role.LOJA, label: t.users.roleStore },
                  ].map(opt => (
                    <label key={opt.value} className={`flex items-center p-3 border-2 cursor-pointer transition-all ${formRole === opt.value ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}>
                      <input type="radio" name="role" className="text-black focus:ring-black" checked={formRole === opt.value} onChange={() => setFormRole(opt.value)} />
                      <span className="ml-2 text-sm font-medium">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 flex gap-3">
              <button onClick={() => setShowModal(false)} className="flex-1 py-3 px-4 border border-gray-200 text-gray-700 hover:bg-gray-50 font-bold uppercase tracking-widest text-sm transition-colors">{t.common.back}</button>
              <button onClick={handleCreate} disabled={submitting} className="flex-1 py-3 px-4 bg-black text-white hover:bg-zinc-800 font-bold uppercase tracking-widest text-sm transition-colors disabled:opacity-50">
                {submitting ? t.form.processing : t.users.create}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;