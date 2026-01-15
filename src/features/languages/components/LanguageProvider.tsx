import { useEffect, useState, useCallback, type FC } from "react";
import { useTranslation } from "react-i18next";

import { DEFAULT_LANGUAGE } from "@/lib/i18n/config";

import { LanguageContext } from "../LanguageContext";

type Props = {
  children: React.ReactNode;
};

const LanguageProviderInner: FC<Props> = ({ children }) => {
  const { i18n } = useTranslation();
  const [language, setLanguageState] = useState<string>(
    i18n.language || DEFAULT_LANGUAGE
  );

  useEffect(() => {
    i18n.on("languageChanged", setLanguageState);
    return () => {
      i18n.off("languageChanged", setLanguageState);
    };
  }, [i18n]);

  const setLanguage = useCallback(
    (newLanguage: string) => {
      i18n.changeLanguage(newLanguage);
      setLanguageState(newLanguage);
    },
    [i18n]
  );

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const LanguageProvider: FC<Props> = ({ children }) => {
  return <LanguageProviderInner>{children}</LanguageProviderInner>;
};
