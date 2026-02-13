import React from 'react';
import { User, Role } from '../types';
import { LogOut, LayoutDashboard, FileText, Settings, User as UserIcon, Store } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
  user: User;
  onLogout: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, user, onLogout }) => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname.includes(path) ? 'bg-red-600 text-white' : 'text-gray-300 hover:bg-gray-800';

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white hidden md:flex flex-col">
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-2xl font-bold text-red-500">Relm Care+</h1>
          <p className="text-xs text-gray-500 mt-1">Gestão de Garantia</p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <Link to="/admin/dashboard" className={`flex items-center p-3 rounded-lg transition-colors ${isActive('dashboard')}`}>
            <LayoutDashboard className="w-5 h-5 mr-3" />
            Dashboard
          </Link>

          {(user.role === Role.ADMIN_RELM || user.role === Role.GERENTE_RELM) && (
            <Link to="/admin/stores" className={`flex items-center p-3 rounded-lg transition-colors ${isActive('stores')}`}>
              <Store className="w-5 h-5 mr-3" />
              Lojas
            </Link>
          )}

          <div className="text-xs font-semibold text-gray-500 uppercase mt-6 mb-2 ml-3">Geral</div>
          <Link to="/admin/reports" className={`flex items-center p-3 rounded-lg transition-colors ${isActive('reports')}`}>
            <FileText className="w-5 h-5 mr-3" />
            Relatórios
          </Link>

          {(user.role === Role.ADMIN_RELM) && (
            <>
              <div className="text-xs font-semibold text-gray-500 uppercase mt-6 mb-2 ml-3">Admin</div>
              <Link to="/admin/users" className={`flex items-center p-3 rounded-lg transition-colors ${isActive('users')}`}>
                <UserIcon className="w-5 h-5 mr-3" />
                Usuários
              </Link>
              <Link to="/admin/settings" className={`flex items-center p-3 rounded-lg transition-colors ${isActive('settings')}`}>
                <Settings className="w-5 h-5 mr-3" />
                Configurações
              </Link>
            </>
          )}
        </nav>

        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center font-bold">
              {user.name.charAt(0)}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">{user.name}</p>
              <p className="text-xs text-gray-500 capitalize">{user.role.replace('_', ' ').toLowerCase()}</p>
            </div>
          </div>
          <button onClick={onLogout} className="w-full flex items-center justify-center p-2 text-sm text-red-400 hover:text-red-300 transition-colors">
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
};