import React, { useEffect, useState } from 'react';
import { User } from '../types';
import { api } from '../services/api';
import { Settings as SettingsIcon, Bell, Shield, Globe, Info, Save, CheckCircle } from 'lucide-react';
import { useT } from '../i18n/LanguageContext';

interface SettingsProps {
   user: User;
}

const Settings: React.FC<SettingsProps> = ({ user }) => {
   const [settings, setSettings] = useState<Record<string, string>>({});
   const [loading, setLoading] = useState(true);
   const [saved, setSaved] = useState(false);
   const { t } = useT();

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

   return (
      <div className="max-w-4xl">
         <div className="flex justify-between items-center mb-8">
            <div>
               <h1 className="text-2xl font-black text-black uppercase italic flex items-center">
                  <SettingsIcon className="w-6 h-6 mr-3 text-black" />
                  {t.settings.settingsTitle}
               </h1>
               <p className="text-gray-400 text-sm mt-1 font-light">{t.settings.settingsDesc}</p>
            </div>
            <button
               onClick={handleSave}
               className="flex items-center px-6 py-2 bg-black text-white hover:bg-zinc-800 transition-colors text-sm font-bold uppercase tracking-widest"
            >
               {saved ? <><CheckCircle className="w-4 h-4 mr-2" /> {t.settings.saved}</> : <><Save className="w-4 h-4 mr-2" /> {t.settings.save}</>}
            </button>
         </div>

         {loading ? (
            <div className="text-gray-400">{t.common.loading}</div>
         ) : (
            <div className="space-y-8">
               {/* Notifications Section */}
               <section className="bg-white shadow-sm border border-gray-100 p-6">
                  <h2 className="text-sm font-black text-black uppercase tracking-widest flex items-center mb-6">
                     <Bell className="w-5 h-5 mr-2 text-black" />
                     {t.settings.notifications}
                  </h2>

                  <div className="space-y-6">
                     <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                        <div>
                           <h3 className="text-sm font-semibold text-black">{t.settings.emailAlerts}</h3>
                           <p className="text-sm text-gray-400 font-light">{t.settings.emailAlertsDesc}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                           <input type="checkbox" className="sr-only peer" defaultChecked />
                           <div className="w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-gray-300 peer-checked:bg-black peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:h-5 after:w-5 after:transition-all"></div>
                        </label>
                     </div>

                     <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                        <div>
                           <h3 className="text-sm font-semibold text-black">{t.settings.statusAlerts}</h3>
                           <p className="text-sm text-gray-400 font-light">{t.settings.statusAlertsDesc}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                           <input type="checkbox" className="sr-only peer" defaultChecked />
                           <div className="w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-gray-300 peer-checked:bg-black peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:h-5 after:w-5 after:transition-all"></div>
                        </label>
                     </div>
                  </div>
               </section>

               {/* Security Section */}
               <section className="bg-white shadow-sm border border-gray-100 p-6">
                  <h2 className="text-sm font-black text-black uppercase tracking-widest flex items-center mb-6">
                     <Shield className="w-5 h-5 mr-2 text-black" />
                     {t.settings.security}
                  </h2>

                  <div className="space-y-4">
                     <div>
                        <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2">{t.settings.warrantyDays}</label>
                        <input
                           type="number"
                           className="w-full md:w-48 border-b border-gray-200 focus:border-black outline-none py-2 rounded-none bg-white"
                           value={settings.warrantyMaxDays || '365'}
                           onChange={(e) => setSettings({ ...settings, warrantyMaxDays: e.target.value })}
                        />
                     </div>
                     <div>
                        <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2">{t.settings.responseTime}</label>
                        <input
                           type="number"
                           className="w-full md:w-48 border-b border-gray-200 focus:border-black outline-none py-2 rounded-none bg-white"
                           value={settings.storeResponseTimeout || '48'}
                           onChange={(e) => setSettings({ ...settings, storeResponseTimeout: e.target.value })}
                        />
                     </div>
                  </div>
               </section>

               {/* General Section */}
               <section className="bg-white shadow-sm border border-gray-100 p-6">
                  <h2 className="text-sm font-black text-black uppercase tracking-widest flex items-center mb-6">
                     <Globe className="w-5 h-5 mr-2 text-black" />
                     {t.layout.general}
                  </h2>
                  <div className="space-y-4">
                     <div>
                        <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2">{t.settings.companyName}</label>
                        <input
                           type="text"
                           className="w-full border-b border-gray-200 focus:border-black outline-none py-2 rounded-none bg-white"
                           value={settings.companyName || 'Relm Bikes'}
                           onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
                        />
                     </div>
                     <div>
                        <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2">{t.settings.supportEmail}</label>
                        <input
                           type="email"
                           className="w-full border-b border-gray-200 focus:border-black outline-none py-2 rounded-none bg-white"
                           value={settings.supportEmail || 'suporte@relmbikes.com'}
                           onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                        />
                     </div>
                  </div>
               </section>

               {/* Info Box */}
               <div className="bg-gray-50 border border-gray-200 p-6 flex items-start">
                  <Info className="w-5 h-5 text-gray-400 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                     <h4 className="text-sm font-bold text-black">{t.settings.aboutConfig}</h4>
                     <p className="text-sm text-gray-400 font-light mt-1">
                        {t.settings.configWarning}
                     </p>
                  </div>
               </div>
            </div>
         )}
      </div>
   );
};

export default Settings;