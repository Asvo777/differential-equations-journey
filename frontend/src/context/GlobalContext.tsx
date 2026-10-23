import React, { createContext, useState, useContext } from 'react';

type GlobalContextValue = {
  language: string;
  setLanguage: React.Dispatch<React.SetStateAction<string>>;
};

const GlobalContext = createContext<GlobalContextValue | undefined>(undefined);

export const GlobalProvider = ({ children }: { children: React.ReactNode }) => {
  const [language, setLanguage] = useState('en'); 

  return (
    <GlobalContext.Provider value={{ language, setLanguage }}>
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobal = () => {
  const context = useContext(GlobalContext);

  if (!context) {
    throw new Error('useGlobal must be used within a GlobalProvider');
  }

  return context;
};
