import React, { createContext, useContext, useState } from 'react';

const LangContext = createContext({ lang: 'bm', toggleLang: () => {} });

export function LangProvider({ children }) {
  const [lang, setLang] = useState('bm');
  const toggleLang = () => setLang((l) => (l === 'bm' ? 'en' : 'bm'));
  return (
    <LangContext.Provider value={{ lang, toggleLang }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}
