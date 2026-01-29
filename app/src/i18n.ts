import i18n from "i18next";
import { initReactI18next } from "react-i18next";

i18n.use(initReactI18next).init({
  resources: {
    en: {
      translation: {
        run: "run",
        stop: "stop",
        upload: "upload",
        cancel: "cancel",
        reconnect: "reconnect",
        tooltip_upload: "Upload the code to the device",
        new_file: "New file",
        open_file: "Open file",
        save_file: "Save file",
        settings: "Settings",
        information: "Information",
        rgbColors: "RGB Colors",
        electronics: "Electronics",
        neopixelAddressing: "Neopixel Addressing",
        ip_address: "IP Address",
        made_with_love: "Made with ♡️ by",
      },
    },
    de: {
      translation: {
        run: "ausführen",
        stop: "anhalten",
        upload: "hochladen",
        cancel: "abbrechen",
        reconnect: "neu verbinden",
        tooltip_upload: "Laden Sie den Code auf das Gerät hoch",
        new_file: "Neue Datei",
        open_file: "Datei öffnen",
        save_file: "Datei speichern",
        settings: "Einstellungen",
        information: "Informationen",
        rgbColors: "RGB Farben",
        electronics: "Elektronik",
        neopixelAddressing: "NeoPixel Adressierung",
        ip_address: "IP-Adresse",
        made_with_love: "Entwickelt mit ♡️ von",
      },
    },
    es: {
      translation: {
        run: "ejecutar",
        stop: "detener",
        upload: "subir",
        cancel: "cancelar",
        reconnect: "reconectar",
        tooltip_upload: "Sube el código al dispositivo",
        new_file: "Nuevo archivo",
        open_file: "Abrir archivo",
        save_file: "Guardar archivo",
        settings: "Configuraciones",
        information: "Información",
        rgbColors: "Colores RGB",
        electronics: "Electrónica",
        neopixelAddressing: "Direccionamiento NeoPixel",
        ip_address: "Dirección IP",
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
