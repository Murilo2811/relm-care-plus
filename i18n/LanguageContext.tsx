import React, { createContext, useContext, useState, useEffect } from 'react';
import { Locale, Translations } from './types';
import { ptBR } from './pt-BR';
import { en } from './en';
import { es } from './es';

const translations: Record<Locale, Translations> = {
    'pt-BR': ptBR,
    'en': en,
    'es': es,
};

interface LanguageContextType {
    locale: Locale;
    setLocale: (locale: Locale) => void;
    t: Translations;
}

const LanguageContext = createContext<LanguageContextType>({
    locale: 'pt-BR',
    setLocale: () => { },
    t: ptBR,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [locale, setLocaleState] = useState<Locale>(() => {
        const saved = localStorage.getItem('lang');
        if (saved && (saved === 'pt-BR' || saved === 'en' || saved === 'es')) {
            return saved as Locale;
        }
        return 'pt-BR';
    });

    const setLocale = (newLocale: Locale) => {
        setLocaleState(newLocale);
        localStorage.setItem('lang', newLocale);
    };

    const t = translations[locale];

    return (
        <LanguageContext.Provider value={{ locale, setLocale, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useT = () => useContext(LanguageContext);

export { type Locale, type Translations };
