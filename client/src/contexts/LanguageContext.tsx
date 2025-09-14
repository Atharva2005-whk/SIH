import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Supported languages
export type SupportedLanguage = 'en' | 'hi' | 'es' | 'fr';

export interface LanguageContextType {
  currentLanguage: SupportedLanguage;
  setLanguage: (language: SupportedLanguage) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  isLoading: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Translation type  
type Translations = Record<string, any>;

// Language configuration
export const LANGUAGES = {
  en: { name: 'English', nativeName: 'English' },
  hi: { name: 'Hindi', nativeName: 'हिन्दी' },
  es: { name: 'Spanish', nativeName: 'Español' },
  fr: { name: 'French', nativeName: 'Français' }
};

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>('en');
  const [translations, setTranslations] = useState<Translations>({});
  const [isLoading, setIsLoading] = useState(true);

  // Load translations for a specific language
  const loadTranslations = async (language: SupportedLanguage): Promise<Translations> => {
    try {
      const response = await import(`../translations/${language}.json`);
      return response.default;
    } catch (error) {
      console.warn(`Failed to load translations for ${language}, falling back to English`);
      try {
        const fallback = await import('../translations/en.json');
        return fallback.default;
      } catch (fallbackError) {
        console.error('Failed to load fallback translations');
        return {};
      }
    }
  };

  // Initialize language from localStorage or browser preference
  useEffect(() => {
    const initializeLanguage = async () => {
      setIsLoading(true);
      
      // Get saved language from localStorage
      const savedLanguage = localStorage.getItem('preferred-language') as SupportedLanguage;
      
      // Get browser language
      const browserLanguage = navigator.language.split('-')[0] as SupportedLanguage;
      
      // Determine initial language
      const initialLanguage = 
        savedLanguage && Object.keys(LANGUAGES).includes(savedLanguage) 
          ? savedLanguage 
          : Object.keys(LANGUAGES).includes(browserLanguage) 
            ? browserLanguage 
            : 'en';

      setCurrentLanguage(initialLanguage);
      
      // Load translations
      const newTranslations = await loadTranslations(initialLanguage);
      setTranslations(newTranslations);
      setIsLoading(false);
    };

    initializeLanguage();
  }, []);

  // Change language
  const setLanguage = async (language: SupportedLanguage) => {
    if (language === currentLanguage) return;
    
    setIsLoading(true);
    
    try {
      const newTranslations = await loadTranslations(language);
      setTranslations(newTranslations);
      setCurrentLanguage(language);
      
      // Save to localStorage
      localStorage.setItem('preferred-language', language);
      
      // Update document language attribute
      document.documentElement.lang = language;
    } catch (error) {
      console.error('Failed to change language:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Translation function
  const t = (key: string, params?: Record<string, string | number>): string => {
    // Handle nested keys like 'dashboard.title'
    const keys = key.split('.');
    let translation: any = translations;
    
    for (const k of keys) {
      if (translation && typeof translation === 'object') {
        translation = translation[k];
      } else {
        translation = undefined;
        break;
      }
    }
    
    // Return key if translation not found
    if (typeof translation !== 'string') {
      console.warn(`Translation missing for key: ${key}`);
      return key;
    }

    // Replace parameters in translation
    if (params) {
      Object.entries(params).forEach(([paramKey, paramValue]) => {
        translation = translation.replace(
          new RegExp(`{{${paramKey}}}`, 'g'), 
          String(paramValue)
        );
      });
    }

    return translation;
  };

  const value: LanguageContextType = {
    currentLanguage,
    setLanguage,
    t,
    isLoading
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

// Hook to use language context
export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

// HOC for class components (if needed)
export function withLanguage<P extends object>(
  Component: React.ComponentType<P & { language: LanguageContextType }>
) {
  return function LanguageComponent(props: P) {
    const language = useLanguage();
    return <Component {...props} language={language} />;
  };
}

export default LanguageContext;
