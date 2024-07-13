import en from "@/assets/i18n/en.json";
import pt from "@/assets/i18n/pt.json";
import keys from "@/constants/keys";
import { getLocales } from "expo-localization";
import { I18n, Scope, TranslateOptions } from "i18n-js";
import React, { createContext, useContext } from "react";

type KeysType = typeof keys;

interface II18nContextData {
  i18n: I18n;
  t: <T = string>(scope: Scope, options?: TranslateOptions) => string | T;
  keys: KeysType;
}

const I18nContext = createContext<II18nContextData>({} as II18nContextData);

interface II18nProviderProps {
  children: React.ReactNode;
}

const I18nProvider: React.FC<II18nProviderProps> = ({ children }) => {
  const defaultLocale = "pt";
  const i18n = new I18n({
    en: en,
    pt: pt,
  });

  i18n.locale = getLocales()[0].languageCode ?? defaultLocale;
  i18n.enableFallback = true;

  return (
    <I18nContext.Provider
      value={{ i18n, t: (ar1, ar2?) => i18n.t(ar1, ar2), keys: keys }}
    >
      {children}
    </I18nContext.Provider>
  );
};

const useI18n = () => {
  const context = useContext(I18nContext);

  if (!context) {
    throw new Error("useI18n must be used inside an I18nProvider");
  }

  return context;
};

export { I18nProvider, useI18n };
