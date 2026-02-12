import React, { useState } from 'react';
import { User, Role } from '../types';
import { Save, Shield, Bell, Power, AlertTriangle, Smartphone, FileText, Globe } from 'lucide-react';

interface SettingsProps {
  user: User;
}

const Settings: React.FC<SettingsProps> = ({ user }) => {
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  // Mock Settings State
  const [config, setConfig] = useState({
    systemName: 'Relm Care+',
    supportEmail: 'suporte@relmbikes.com',
    maintenanceMode: false,
    defaultWarrantyMonths: 24,
    autoApproveStores: false,
    whatsappEnabled: true,
    whatsappApiKey: 'sk_live_********************',
    termsUrl: 'https://relmbikes.com/warranty-policy'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setConfig(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API Call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setLoading(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (user.role !== Role.ADMIN_RELM) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-gray-500">
        <AlertTriangle className="w-12 h-12 mb-4 text-yellow-500" />
        <h2 className="text-xl font-bold">Acesso Restrito</h2>
        <p>Apenas administradores podem acessar as configurações globais.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Configurações do Sistema</h1>
          <p className="text-gray-500 text-sm mt-1">Gerencie regras globais, integrações e parâmetros da garantia.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={loading}
          className="flex items-center px-6 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-black transition-all shadow-lg shadow-gray-200 disabled:opacity-70"
        >
          {loading ? (
             <span className="flex items-center"><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div> Salvando...</span>
          ) : (
             <><Save className="w-4 h-4 mr-2" /> Salvar Alterações</>
          )}
        </button>
      </div>

      {saved && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center animate-fade-in">
          <Shield className="w-5 h-5 mr-2" /> Configurações atualizadas com sucesso!
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* General Settings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
           <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center border-b border-gray-100 pb-4">
              <Globe className="w-5 h-5 mr-2 text-red-600" /> Geral & Acesso
           </h2>
           <div className="space-y-5">
              <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Sistema</label>
                 <input 
                    name="systemName"
                    value={config.systemName}
                    onChange={handleChange}
                    className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-red-500 focus:border-red-500 px-3 py-2"
                 />
              </div>
              <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Email de Suporte (Notificações)</label>
                 <input 
                    name="supportEmail"
                    value={config.supportEmail}
                    onChange={handleChange}
                    className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-red-500 focus:border-red-500 px-3 py-2"
                 />
              </div>
              <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg border border-gray-200">
                 <div>
                    <span className="block text-sm font-bold text-gray-900">Modo Manutenção</span>
                    <span className="text-xs text-gray-500">Bloqueia acesso ao formulário público</span>
                 </div>
                 <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" name="maintenanceMode" checked={config.maintenanceMode} onChange={handleChange} className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                 </label>
              </div>
           </div>
        </div>

        {/* Warranty Rules */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
           <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center border-b border-gray-100 pb-4">
              <Shield className="w-5 h-5 mr-2 text-red-600" /> Regras de Garantia
           </h2>
           <div className="space-y-5">
              <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Período Padrão (Meses)</label>
                 <div className="flex items-center">
                    <input 
                        type="number"
                        name="defaultWarrantyMonths"
                        value={config.defaultWarrantyMonths}
                        onChange={handleChange}
                        className="w-24 border-gray-300 rounded-lg shadow-sm focus:ring-red-500 focus:border-red-500 px-3 py-2 mr-3"
                    />
                    <span className="text-sm text-gray-500">meses a partir da compra</span>
                 </div>
              </div>
              
              <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Link dos Termos de Garantia</label>
                 <div className="flex">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">https://</span>
                    <input 
                        name="termsUrl"
                        value={config.termsUrl.replace('https://', '')}
                        onChange={handleChange}
                        className="flex-1 border-gray-300 rounded-r-lg shadow-sm focus:ring-red-500 focus:border-red-500 px-3 py-2"
                    />
                 </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                 <div>
                    <span className="block text-sm font-bold text-gray-900">Aprovação Automática (Lojas)</span>
                    <span className="text-xs text-gray-500">Permitir que revendas Premium aprovem garantias nível 1</span>
                 </div>
                 <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" name="autoApproveStores" checked={config.autoApproveStores} onChange={handleChange} className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                 </label>
              </div>
           </div>
        </div>

        {/* Integrations */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 lg:col-span-2">
           <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center border-b border-gray-100 pb-4">
              <Smartphone className="w-5 h-5 mr-2 text-red-600" /> Integrações & API
           </h2>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div>
                  <div className="flex items-center justify-between mb-4">
                     <label className="text-sm font-medium text-gray-700 flex items-center">
                        <div className={`w-2 h-2 rounded-full mr-2 ${config.whatsappEnabled ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                        WhatsApp Business API
                     </label>
                     <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" name="whatsappEnabled" checked={config.whatsappEnabled} onChange={handleChange} className="sr-only peer" />
                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-600"></div>
                     </label>
                  </div>
                  <input 
                      type="password"
                      name="whatsappApiKey"
                      value={config.whatsappApiKey}
                      onChange={handleChange}
                      disabled={!config.whatsappEnabled}
                      className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-red-500 focus:border-red-500 px-3 py-2 font-mono text-sm bg-gray-50"
                  />
                  <p className="text-xs text-gray-500 mt-2">Chave da API do provedor de mensagens (Ex: Twilio/Z-API).</p>
               </div>
               
               <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <h4 className="text-sm font-bold text-blue-900 mb-2">Webhook de Eventos</h4>
                  <p className="text-xs text-blue-700 mb-3">
                     Configure uma URL para receber atualizações de status de garantia em tempo real no seu ERP.
                  </p>
                  <button className="text-xs font-bold text-blue-600 hover:text-blue-800 underline">
                     Configurar Webhooks &rarr;
                  </button>
               </div>
           </div>
        </div>

      </div>
    </div>
  );
};

export default Settings;