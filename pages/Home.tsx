import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, LogIn, ChevronRight, CheckCircle, Search } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      {/* Navbar */}
      <nav className="border-b border-gray-100 py-5 px-6 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="text-2xl font-bold italic tracking-tighter text-red-600 select-none">
            RELM <span className="text-black not-italic font-normal">CARE+</span>
          </div>
          <Link 
            to="/login" 
            className="text-sm font-medium text-gray-600 hover:text-red-600 transition-colors flex items-center"
          >
            <LogIn className="w-4 h-4 mr-2" />
            Acesso Restrito
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-4xl w-full space-y-12 text-center">
          
          <div className="space-y-4 animate-fade-in-up">
            <h1 className="text-5xl font-extrabold text-gray-900 tracking-tight sm:text-6xl">
              Garantia e Suporte <span className="text-red-600">Relm Bikes</span>
            </h1>
            <p className="text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
              Central oficial para registro de produtos, abertura de chamados e gestão de garantias para clientes e parceiros autorizados.
            </p>
          </div>

          <div className="max-w-md mx-auto mt-12 w-full">
            
            {/* Card Cliente */}
            <div className="group relative bg-white p-8 rounded-3xl shadow-sm border-2 border-transparent hover:border-red-100 hover:shadow-2xl hover:shadow-red-500/10 transition-all duration-300 text-left overflow-hidden flex flex-col">
              <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500">
                <ShieldCheck className="w-32 h-32 text-red-600" />
              </div>
              
              <div className="relative z-10">
                  <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mb-6 text-red-600 group-hover:bg-red-600 group-hover:text-white transition-colors duration-300">
                    <ShieldCheck className="w-7 h-7" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Sou Cliente</h3>
                  <p className="text-gray-500 leading-relaxed mb-6">
                    Registre seu produto ou consulte o andamento de uma solicitação existente.
                  </p>
              </div>
              
              <div className="relative z-10 mt-auto flex flex-col gap-3">
                <Link to="/register" className="w-full flex items-center justify-between px-4 py-3 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-colors">
                  Registrar Nova <ChevronRight className="w-5 h-5" />
                </Link>
                <Link to="/track" className="w-full flex items-center justify-between px-4 py-3 bg-red-50 text-red-700 rounded-lg font-bold hover:bg-red-100 transition-colors">
                  Consultar Protocolo <Search className="w-5 h-5" />
                </Link>
              </div>
            </div>

          </div>

          <div className="pt-10 flex justify-center space-x-8 text-sm text-gray-400">
            <div className="flex items-center"><CheckCircle className="w-4 h-4 mr-2 text-green-500" /> Processo 100% Digital</div>
            <div className="flex items-center"><CheckCircle className="w-4 h-4 mr-2 text-green-500" /> Acompanhamento em Tempo Real</div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
          <p>© 2024 Relm Bikes. Todos os direitos reservados.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-gray-600">Política de Privacidade</a>
            <a href="#" className="hover:text-gray-600">Termos de Uso</a>
            <a href="#" className="hover:text-gray-600">Suporte</a>
          </div>
        </div>
      </footer>
    </div>
  );
}