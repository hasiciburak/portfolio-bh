"use client";

import React, { createContext, useContext, useEffect } from "react";
import type { Locale, Dictionary } from "@/app/[lang]/dictionaries";

interface LanguageContextProps {
  lang: Locale;
  dict: Dictionary;
}

const LanguageContext = createContext<LanguageContextProps | null>(null);

export const LanguageProvider = ({
  lang,
  dict,
  children,
}: {
  lang: Locale;
  dict: Dictionary;
  children: React.ReactNode;
}) => {
  // Synchronize the HTML lang attribute dynamically for accessiblity and SEO.
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, dict }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useTranslation must be used within a LanguageProvider");
  }
  return context;
};
