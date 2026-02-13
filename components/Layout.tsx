import React, { useMemo } from 'react';
import { User, Role } from '../types';
import { LogOut, LayoutDashboard, FileText, Settings, User as UserIcon, Store } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useT } from '../i18n/LanguageContext';
import { LanguageSelector } from '../components/LanguageSelector';

interface LayoutProps {
  children: React.ReactNode;
  user: User;
  onLogout: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, user, onLogout }) => {
  const location = useLocation();
  const { t } = useT();

  const isActive = (path: string) => location.pathname.includes(path) ? 'bg-white text-black' : 'text-gray-400 hover:bg-gray-800 hover:text-white';

  return (
    <div className="flex h-screen bg-gray-50 flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-black text-white flex flex-col md:h-screen sticky top-0 z-50">
        <div className="p-6 border-b border-gray-800 flex justify-between items-center md:block">
          <div>
            <h1 className="text-xl font-black italic tracking-tighter uppercase">RELM <span className="text-gray-500 not-italic font-normal">CARE+</span></h1>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-600 mt-1">{t.common.warrantyManagement}</p>
          </div>
          <div className="md:hidden">
            <LanguageSelector variant="dark" />
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto hidden md:block">
          <Link to="/admin/dashboard" className={`flex items-center p-3 transition-colors text-sm font-medium ${isActive('dashboard')}`}>
            <LayoutDashboard className="w-5 h-5 mr-3" />
            {t.layout.dashboard}
          </Link>

          {(user.role === Role.ADMIN_RELM || user.role === Role.GERENTE_RELM) && (
            <Link to="/admin/stores" className={`flex items-center p-3 transition-colors text-sm font-medium ${isActive('stores')}`}>
              <Store className="w-5 h-5 mr-3" />
              {t.layout.stores}
            </Link>
          )}

          <div className="text-[10px] font-black text-gray-600 uppercase tracking-widest mt-6 mb-2 ml-3">{t.layout.general}</div>
          <Link to="/admin/reports" className={`flex items-center p-3 transition-colors text-sm font-medium ${isActive('reports')}`}>
            <FileText className="w-5 h-5 mr-3" />
            {t.layout.reports}
          </Link>

          {(user.role === Role.ADMIN_RELM) && (
            <>
              <div className="text-[10px] font-black text-gray-600 uppercase tracking-widest mt-6 mb-2 ml-3">{t.layout.admin}</div>
              <Link to="/admin/users" className={`flex items-center p-3 transition-colors text-sm font-medium ${isActive('users')}`}>
                <UserIcon className="w-5 h-5 mr-3" />
                {t.layout.users}
              </Link>
              <Link to="/admin/settings" className={`flex items-center p-3 transition-colors text-sm font-medium ${isActive('settings')}`}>
                <Settings className="w-5 h-5 mr-3" />
                {t.layout.settings}
              </Link>
            </>
          )}
        </nav>

        <div className="p-4 border-t border-gray-800 hidden md:block">
          <div className="mb-4 flex flex-col gap-2">
            <div className="text-[10px] font-bold text-gray-600 uppercase tracking-wider mb-2">Language</div>
            <LanguageSelector variant="dark" />
          </div>

          <div className="flex items-center mb-4 pt-4 border-t border-gray-800">
            <div className="w-8 h-8 bg-white text-black flex items-center justify-center font-black text-sm">
              {user.name.charAt(0)}
            </div>
            <div className="ml-3 overflow-hidden">
              <p className="text-sm font-medium truncate">{user.name}</p>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold truncate">{user.role}</p>
            </div>
          </div>
          <button onClick={onLogout} className="w-full flex items-center justify-center p-2 text-sm text-gray-500 hover:text-white transition-colors">
            <LogOut className="w-4 h-4 mr-2" />
            {t.layout.logout}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-gray-50 h-full">
        <div className="p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};