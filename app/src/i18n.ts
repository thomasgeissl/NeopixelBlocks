import i18n from "i18next";
import { initReactI18next } from "react-i18next";

i18n.use(initReactI18next).init({
  resources: {
    en: {
      translation: {
        run: "run",
        stop: "stop",
        upload: "upload",
        tooltip_upload: "Upload the code to the device",
        made_with_love: "Made with ♡️ by",
      },
    },
    de: {
      translation: {
        run: "ausführen",
        stop: "anhalten",
        upload: "hochladen",
        tooltip_upload: "Laden Sie den Code auf das Gerät hoch",
        made_with_love: "Entwickelt mit ♡️ von",
      },
    },
    es: {
      translation: {
        run: "ejecutar",
        stop: "detener",
        upload: "subir",
        tooltip_upload: "Sube el código al dispositivo",
        made_with_love: "Desarrollado con ♡️ por",
      },
    },
  },
  lng: "de", // if you're using a language detector, do not define the lng option
  fallbackLng: "en",
  interpolation: {
    escapeValue: false, // react already safes from xss => https://www.i18next.com/translation-function/interpolation#unescape
  },
});
