import React from 'react';
import { useT, Locale } from '../i18n/LanguageContext';

const FLAGS: Record<Locale, string> = {
    'pt-BR': '🇧🇷',
    'en': '🇺🇸',
    'es': '🇪🇸',
};

const LABELS: Record<Locale, string> = {
    'pt-BR': 'PT',
    'en': 'EN',
    'es': 'ES',
};

interface LanguageSelectorProps {
    variant?: 'light' | 'dark';
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ variant = 'light' }) => {
    const { locale, setLocale } = useT();

    const locales: Locale[] = ['pt-BR', 'en', 'es'];

    const activeClass = variant === 'dark'
        ? 'bg-white text-black'
        : 'bg-black text-white';

    const inactiveClass = variant === 'dark'
        ? 'text-gray-500 hover:text-white hover:bg-gray-800'
        : 'text-gray-400 hover:text-black hover:bg-gray-100';

    return (
        <div className="flex items-center gap-1">
            {locales.map((loc) => (
                <button
                    key={loc}
                    onClick={() => setLocale(loc)}
                    className={`px-2 py-1 text-[10px] font-black uppercase tracking-widest transition-all ${locale === loc ? activeClass : inactiveClass
                        }`}
                    title={FLAGS[loc]}
                >
                    {FLAGS[loc]} {LABELS[loc]}
                </button>
            ))}
        </div>
    );
};
