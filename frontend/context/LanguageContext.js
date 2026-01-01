"use client";
import { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../translations';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
    const [lang, setLang] = useState('en');

    useEffect(() => {
        const savedLang = localStorage.getItem('opentrace_lang');
        if (savedLang) {
            setLang(savedLang);
        }
    }, []);

    const t = (path) => {
        const keys = path.split('.');
        let result = translations[lang];
        for (const key of keys) {
            if (result[key]) {
                result = result[key];
            } else {
                return path;
            }
        }
        return result;
    };

    const toggleLang = () => {
        const order = ['en', 'ua', 'pl', 'de'];
        const currentIndex = order.indexOf(lang);
        const nextIndex = (currentIndex + 1) % order.length;
        const newLang = order[nextIndex];
        setLang(newLang);
        localStorage.setItem('opentrace_lang', newLang);
    };

    const setLanguage = (newLang) => {
        if (translations[newLang]) {
            setLang(newLang);
            localStorage.setItem('opentrace_lang', newLang);
        }
    };

    return (
        <LanguageContext.Provider value={{ lang, t, toggleLang, setLanguage }}>
            {children}
        </LanguageContext.Provider>
    );
}

export const useTranslation = () => useContext(LanguageContext);
