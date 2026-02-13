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

  const isActive = (path: string) => location.pathname.includes(path) ? 'bg-white text-black' : 'text-gray-400 hover:bg-gray-800 hover:text-white';

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-black text-white hidden md:flex flex-col">
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-xl font-black italic tracking-tighter uppercase">RELM <span className="text-gray-500 not-italic font-normal">CARE+</span></h1>
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-600 mt-1">Gestão de Garantia</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <Link to="/admin/dashboard" className={`flex items-center p-3 transition-colors text-sm font-medium ${isActive('dashboard')}`}>
            <LayoutDashboard className="w-5 h-5 mr-3" />
            Dashboard
          </Link>

          {(user.role === Role.ADMIN_RELM || user.role === Role.GERENTE_RELM) && (
            <Link to="/admin/stores" className={`flex items-center p-3 transition-colors text-sm font-medium ${isActive('stores')}`}>
              <Store className="w-5 h-5 mr-3" />
              Lojas
            </Link>
          )}

          <div className="text-[10px] font-black text-gray-600 uppercase tracking-widest mt-6 mb-2 ml-3">Geral</div>
          <Link to="/admin/reports" className={`flex items-center p-3 transition-colors text-sm font-medium ${isActive('reports')}`}>
            <FileText className="w-5 h-5 mr-3" />
            Relatórios
          </Link>

          {(user.role === Role.ADMIN_RELM) && (
            <>
              <div className="text-[10px] font-black text-gray-600 uppercase tracking-widest mt-6 mb-2 ml-3">Admin</div>
              <Link to="/admin/users" className={`flex items-center p-3 transition-colors text-sm font-medium ${isActive('users')}`}>
                <UserIcon className="w-5 h-5 mr-3" />
                Usuários
              </Link>
              <Link to="/admin/settings" className={`flex items-center p-3 transition-colors text-sm font-medium ${isActive('settings')}`}>
                <Settings className="w-5 h-5 mr-3" />
                Configurações
              </Link>
            </>
          )}
        </nav>

        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 bg-white text-black flex items-center justify-center font-black text-sm">
              {user.name.charAt(0)}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">{user.name}</p>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">{user.role.replace('_', ' ').toLowerCase()}</p>
            </div>
          </div>
          <button onClick={onLogout} className="w-full flex items-center justify-center p-2 text-sm text-gray-500 hover:text-white transition-colors">
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