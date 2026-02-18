import React, { useEffect, useState } from 'react';
import { User } from '../types';
import { api } from '../services/api';
import { Globe, Shield, Smartphone, Save, CheckCircle, ExternalLink, Lock, Eye, EyeOff } from 'lucide-react';
import { useT } from '../i18n/LanguageContext';

interface SettingsProps {
   user: User;
}

const Settings: React.FC<SettingsProps> = ({ user }) => {
   const [settings, setSettings] = useState<Record<string, string>>({});
   const [loading, setLoading] = useState(true);
   const [saved, setSaved] = useState(false);
   const { t } = useT();

   // Password change state
   const [currentPassword, setCurrentPassword] = useState('');
   const [newPassword, setNewPassword] = useState('');
   const [confirmPassword, setConfirmPassword] = useState('');
   const [showCurrentPwd, setShowCurrentPwd] = useState(false);
   const [showNewPwd, setShowNewPwd] = useState(false);
   const [showConfirmPwd, setShowConfirmPwd] = useState(false);
   const [pwdLoading, setPwdLoading] = useState(false);
   const [pwdSuccess, setPwdSuccess] = useState('');
   const [pwdError, setPwdError] = useState('');

   useEffect(() => {
      const load = async () => {
         try {
            const data = await (api as any).settings?.get?.() || {};
            setSettings(data || {});
         } catch (e) { console.error(e); }
         setLoading(false);
      };
      load();
   }, []);

   const handleSave = async () => {
      try {
         await (api as any).settings?.update?.(settings);
         setSaved(true);
         setTimeout(() => setSaved(false), 2000);
      } catch (e) { console.error(e); }
   };

   const handleChangePassword = async () => {
      setPwdError('');
      setPwdSuccess('');
      if (newPassword.length < 6) {
         setPwdError(t.settings.passwordMinLength);
         return;
      }
      if (newPassword !== confirmPassword) {
         setPwdError(t.settings.passwordMismatch);
         return;
      }
      setPwdLoading(true);
      try {
         await (api.auth as any).changePassword(currentPassword, newPassword);
         setPwdSuccess(t.settings.passwordChanged);
         setCurrentPassword('');
         setNewPassword('');
         setConfirmPassword('');
      } catch (e: any) {
         setPwdError(e.message || t.settings.passwordError);
      } finally {
         setPwdLoading(false);
      }
   };

   const toggleSetting = (key: string) => {
      const current = settings[key] === 'true';
      setSettings({ ...settings, [key]: String(!current) });
   };

   return (
      <div className="max-w-6xl mx-auto">
         {/* Header */}
         <div className="flex justify-between items-center mb-8">
            <div>
               <h1 className="text-2xl font-black text-black uppercase italic">
                  {t.settings.settings}
               </h1>
               <p className="text-gray-400 text-sm mt-1 font-light">{t.settings.aboutSettingsDesc}</p>
            </div>
            <button
               onClick={handleSave}
               className="flex items-center px-6 py-2 bg-black text-white hover:bg-zinc-800 transition-colors text-sm font-bold uppercase tracking-widest"
            >
               {saved
                  ? <><CheckCircle className="w-4 h-4 mr-2" />{t.settings.saved}</>
                  : <><Save className="w-4 h-4 mr-2" />{t.settings.save}</>
               }
            </button>
         </div>

         {loading ? (
            <div className="text-gray-400">{t.common.loading}</div>
         ) : (
            <div className="space-y-6">

               {/* Row 1: Geral & Garantia */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                  {/* Geral & Acesso */}
                  <section className="bg-white p-6 shadow-sm border border-gray-100">
                     <h2 className="text-sm font-black text-red-600 uppercase tracking-widest flex items-center mb-6">
                        <Globe className="w-5 h-5 mr-2 text-red-600" />
                        {t.settings.generalAccess}
                     </h2>
                     <div className="space-y-4">
                        <div>
                           <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2">
                              {t.settings.companyName}
                           </label>
                           <input
                              type="text"
                              className="w-full border-b border-gray-200 focus:border-red-600 outline-none py-2 bg-transparent transition-colors"
                              value={settings.companyName || 'Relm Care+'}
                              onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
                           />
                        </div>
                        <div>
                           <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2">
                              {t.settings.supportEmail}
                           </label>
                           <input
                              type="email"
                              className="w-full border-b border-gray-200 focus:border-red-600 outline-none py-2 bg-transparent transition-colors"
                              value={settings.supportEmail || 'suporte@relmbikes.com'}
                              onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                           />
                        </div>
                        <div className="pt-2 flex items-center justify-between">
                           <div>
                              <h3 className="text-sm font-bold text-black">{t.settings.maintenanceMode}</h3>
                              <p className="text-xs text-gray-400 font-light mt-1">{t.settings.maintenanceModeDesc}</p>
                           </div>
                           <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                 type="checkbox"
                                 className="sr-only peer"
                                 checked={settings.maintenanceMode === 'true'}
                                 onChange={() => toggleSetting('maintenanceMode')}
                              />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-red-100 peer-checked:bg-red-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:h-5 after:w-5 after:transition-all"></div>
                           </label>
                        </div>
                     </div>
                  </section>

                  {/* Regras de Garantia */}
                  <section className="bg-white p-6 shadow-sm border border-gray-100">
                     <h2 className="text-sm font-black text-red-600 uppercase tracking-widest flex items-center mb-6">
                        <Shield className="w-5 h-5 mr-2 text-red-600" />
                        {t.settings.warrantyRules}
                     </h2>
                     <div className="space-y-4">
                        <div>
                           <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2">
                              {t.settings.defaultPeriod}
                           </label>
                           <div className="flex items-center">
                              <input
                                 type="number"
                                 className="w-24 border-b border-gray-200 focus:border-red-600 outline-none py-2 bg-transparent"
                                 value={settings.warrantyMaxDays || '24'}
                                 onChange={(e) => setSettings({ ...settings, warrantyMaxDays: e.target.value })}
                              />
                              <span className="ml-3 text-sm text-gray-400 font-light">meses a partir da compra</span>
                           </div>
                        </div>
                        <div>
                           <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2">
                              {t.settings.warrantyTermsLink}
                           </label>
                           <input
                              type="text"
                              className="w-full border-b border-gray-200 focus:border-red-600 outline-none py-2 bg-transparent"
                              value={settings.warrantyTermsUrl || 'https://relmbikes.com/warranty-policy'}
                              onChange={(e) => setSettings({ ...settings, warrantyTermsUrl: e.target.value })}
                           />
                        </div>
                        <div className="pt-2 flex items-center justify-between">
                           <div>
                              <h3 className="text-sm font-bold text-black">{t.settings.autoApproval}</h3>
                              <p className="text-xs text-gray-400 font-light mt-1">{t.settings.autoApprovalDesc}</p>
                           </div>
                           <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                 type="checkbox"
                                 className="sr-only peer"
                                 checked={settings.autoApproval === 'true'}
                                 onChange={() => toggleSetting('autoApproval')}
                              />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-red-100 peer-checked:bg-red-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:h-5 after:w-5 after:transition-all"></div>
                           </label>
                        </div>
                     </div>
                  </section>

               </div>

               {/* Row 2: Integrações */}
               <section className="bg-white p-6 shadow-sm border border-gray-100">
                  <h2 className="text-sm font-black text-red-600 uppercase tracking-widest flex items-center mb-6">
                     <Smartphone className="w-5 h-5 mr-2 text-red-600" />
                     {t.settings.integrations}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div>
                        <div className="flex items-center justify-between mb-4">
                           <div className="flex items-center">
                              <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                              <h3 className="text-sm font-bold text-black">{t.settings.whatsappApi}</h3>
                           </div>
                           <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                 type="checkbox"
                                 className="sr-only peer"
                                 checked={settings.whatsappEnabled === 'true'}
                                 onChange={() => toggleSetting('whatsappEnabled')}
                              />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-green-100 peer-checked:bg-green-500 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:h-5 after:w-5 after:transition-all"></div>
                           </label>
                        </div>
                        <input
                           type="password"
                           className="w-full bg-gray-50 border border-gray-200 rounded p-3 text-sm outline-none focus:border-green-500 transition-colors"
                           placeholder={t.settings.whatsappKeyPlaceholder}
                           value={settings.whatsappKey || ''}
                           onChange={(e) => setSettings({ ...settings, whatsappKey: e.target.value })}
                        />
                        <p className="text-xs text-gray-400 mt-2">Chave da API do provedor de mensagens (Ex: Twilio/Z-API).</p>
                     </div>
                     <div className="bg-blue-50 border border-blue-100 p-5 rounded">
                        <h3 className="text-sm font-bold text-blue-800 mb-2">{t.settings.webhookEvents}</h3>
                        <p className="text-xs text-blue-600 mb-4 leading-relaxed">{t.settings.webhookDesc}</p>
                        <a href="#" className="inline-flex items-center text-xs font-bold text-blue-700 hover:text-blue-900 uppercase tracking-wider">
                           {t.settings.configureWebhooks} <ExternalLink className="w-3 h-3 ml-1" />
                        </a>
                     </div>
                  </div>
               </section>

               {/* Row 3: Segurança — Alteração de Senha */}
               <section className="bg-white p-6 shadow-sm border border-gray-100">
                  <h2 className="text-sm font-black text-red-600 uppercase tracking-widest flex items-center mb-6">
                     <Lock className="w-5 h-5 mr-2 text-red-600" />
                     {t.settings.changePassword}
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                     {/* Senha Atual */}
                     <div>
                        <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2">
                           {t.settings.currentPassword}
                        </label>
                        <div className="relative">
                           <input
                              type={showCurrentPwd ? 'text' : 'password'}
                              className="w-full border-b border-gray-200 focus:border-red-600 outline-none py-2 bg-transparent pr-8 transition-colors"
                              value={currentPassword}
                              onChange={(e) => setCurrentPassword(e.target.value)}
                              placeholder="••••••••"
                           />
                           <button
                              type="button"
                              onClick={() => setShowCurrentPwd(!showCurrentPwd)}
                              className="absolute right-0 top-2 text-gray-400 hover:text-gray-600"
                           >
                              {showCurrentPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                           </button>
                        </div>
                     </div>

                     {/* Nova Senha */}
                     <div>
                        <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2">
                           {t.settings.newPassword}
                        </label>
                        <div className="relative">
                           <input
                              type={showNewPwd ? 'text' : 'password'}
                              className="w-full border-b border-gray-200 focus:border-red-600 outline-none py-2 bg-transparent pr-8 transition-colors"
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              placeholder="••••••••"
                           />
                           <button
                              type="button"
                              onClick={() => setShowNewPwd(!showNewPwd)}
                              className="absolute right-0 top-2 text-gray-400 hover:text-gray-600"
                           >
                              {showNewPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                           </button>
                        </div>
                     </div>

                     {/* Confirmar Nova Senha */}
                     <div>
                        <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2">
                           {t.settings.confirmPassword}
                        </label>
                        <div className="relative">
                           <input
                              type={showConfirmPwd ? 'text' : 'password'}
                              className="w-full border-b border-gray-200 focus:border-red-600 outline-none py-2 bg-transparent pr-8 transition-colors"
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              placeholder="••••••••"
                           />
                           <button
                              type="button"
                              onClick={() => setShowConfirmPwd(!showConfirmPwd)}
                              className="absolute right-0 top-2 text-gray-400 hover:text-gray-600"
                           >
                              {showConfirmPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                           </button>
                        </div>
                     </div>

                  </div>

                  {/* Feedback */}
                  {pwdError && (
                     <p className="mt-4 text-sm text-red-600 font-medium">{pwdError}</p>
                  )}
                  {pwdSuccess && (
                     <p className="mt-4 text-sm text-green-600 font-medium flex items-center">
                        <CheckCircle className="w-4 h-4 mr-1" />{pwdSuccess}
                     </p>
                  )}

                  <div className="mt-6">
                     <button
                        onClick={handleChangePassword}
                        disabled={pwdLoading || !currentPassword || !newPassword || !confirmPassword}
                        className="flex items-center px-6 py-2 bg-black text-white hover:bg-zinc-800 transition-colors text-sm font-bold uppercase tracking-widest disabled:opacity-40 disabled:cursor-not-allowed"
                     >
                        <Lock className="w-4 h-4 mr-2" />
                        {pwdLoading ? t.settings.changingPassword : t.settings.changePassword}
                     </button>
                  </div>

               </section>

            </div>
         )}
      </div>
   );
};

export default Settings;