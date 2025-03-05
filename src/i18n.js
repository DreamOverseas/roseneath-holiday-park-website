import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpApi from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(HttpApi) // Loading Remote Translation Files with HttpApi
  .use(LanguageDetector) // Automatic detection of browser language
  .use(initReactI18next) // Making i18next work with React
  .init({
    backend: {
      loadPath: '/locales/{{lng}}.json', // Specify the path to the translation file
    },
    lng: 'en',
    fallbackLng: 'zh',
    interpolation: {
      escapeValue: false, // Prevent XSS，React has its own protection.
    },
    react: {
      useSuspense: false, // Ensure component loading doesn't hang due to translation waiting
    },
  });

export default i18n;