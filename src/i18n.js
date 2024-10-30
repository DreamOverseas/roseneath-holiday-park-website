import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpApi from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(HttpApi) // 使用 HttpApi 加载远程翻译文件
  .use(LanguageDetector) // 自动检测浏览器语言
  .use(initReactI18next) // 使 i18next 与 React 结合使用
  .init({
    backend: {
      loadPath: '/locales/{{lng}}.json', // 指定翻译文件路径
    },
    lng: 'en', // 默认语言
    fallbackLng: 'zh', // 回退语言
    interpolation: {
      escapeValue: false, // 防止 XSS，React 本身有防护机制
    },
    react: {
      useSuspense: false, // 确保组件加载时不会因翻译等待而挂起
    },
  });

export default i18n;