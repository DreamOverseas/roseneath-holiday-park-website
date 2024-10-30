import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import HttpApi from "i18next-http-backend";
import { initReactI18next } from "react-i18next";

i18n
  .use(HttpApi) // 允许从远程加载翻译文件
  .use(LanguageDetector) // 自动检测浏览器语言
  .use(initReactI18next) // 使 i18next 能与 react 结合使用
  .init({
    backend: {
      loadPath: "/locales/{{lng}}.json", // 指定翻译文件的路径
    },
    lng: "en", // 默认语言
    fallbackLng: "zh", // 当无法找到特定语言时回退到英文
    interpolation: {
      escapeValue: false, // React 本身具有 XSS 防护，不需要再次转义
    },
  });

export default i18n;
