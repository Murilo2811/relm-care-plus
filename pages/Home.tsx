import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, LogIn, ChevronRight, CheckCircle, Search } from 'lucide-react';
import { useT } from '../i18n/LanguageContext';
import { LanguageSelector } from '../components/LanguageSelector';

export default function Home() {
  const { t } = useT();

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      {/* Navbar */}
      <nav className="border-b border-gray-100 py-5 px-6 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="text-2xl font-black italic tracking-tighter text-black uppercase select-none">
            RELM <span className="not-italic font-normal text-gray-500">CARE+</span>
          </div>
          <div className="flex items-center gap-4">
            <LanguageSelector />
            <Link
              to="/login"
              className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 hover:text-black transition-colors flex items-center"
            >
              <LogIn className="w-4 h-4 mr-2" />
              {t.common.restrictedAccess}
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 bg-white">
        <div className="max-w-4xl w-full space-y-12 text-center">

          <div className="space-y-4">
            <h1 className="text-5xl font-black text-black tracking-tight sm:text-6xl uppercase italic">
              {t.home.heroTitle} <span className="text-gray-400">{t.home.heroTitleHighlight}</span>
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed font-light">
              {t.home.heroSubtitle}
            </p>
          </div>

          <div className="max-w-md mx-auto mt-12 w-full">

            {/* Card Cliente */}
            <div className="group relative bg-white p-8 shadow-sm border border-gray-100 hover:border-gray-300 hover:shadow-lg transition-all duration-300 text-left overflow-hidden flex flex-col">
              <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500">
                <ShieldCheck className="w-32 h-32 text-black" />
              </div>

              <div className="relative z-10">
                <div className="w-14 h-14 bg-gray-50 flex items-center justify-center mb-6 text-black group-hover:bg-black group-hover:text-white transition-colors duration-300">
                  <ShieldCheck className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-black text-black mb-2 uppercase italic">{t.home.iamClient}</h3>
                <p className="text-gray-400 leading-relaxed mb-6 font-light">
                  {t.home.clientDescription}
                </p>
              </div>

              <div className="relative z-10 mt-auto flex flex-col gap-3">
                <Link to="/register" className="w-full flex items-center justify-between px-4 py-3 bg-black text-white font-bold uppercase tracking-widest text-sm hover:bg-zinc-800 transition-colors">
                  {t.home.registerNew} <ChevronRight className="w-5 h-5" />
                </Link>
                <Link to="/track" className="w-full flex items-center justify-between px-4 py-3 bg-gray-100 text-black font-bold uppercase tracking-widest text-sm hover:bg-gray-200 transition-colors">
                  {t.home.checkProtocol} <Search className="w-5 h-5" />
                </Link>
              </div>
            </div>

          </div>

          <div className="pt-10 flex justify-center space-x-8 text-[10px] font-bold uppercase tracking-widest text-gray-300">
            <div className="flex items-center"><CheckCircle className="w-4 h-4 mr-2 text-black" /> {t.home.digitalProcess}</div>
            <div className="flex items-center"><CheckCircle className="w-4 h-4 mr-2 text-black" /> {t.home.realTimeTracking}</div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center text-[10px] font-bold uppercase tracking-widest text-gray-300">
          <p>{t.common.copyright}</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-black transition-colors">{t.common.privacyPolicy}</a>
            <a href="#" className="hover:text-black transition-colors">{t.common.termsOfUse}</a>
            <a href="#" className="hover:text-black transition-colors">{t.common.support}</a>
          </div>
        </div>
      </footer>
    </div>
  );
}