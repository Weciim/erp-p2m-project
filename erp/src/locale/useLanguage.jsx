// useLanguage.js
import languages from "./translation/translation";

const getLabel = (key, locale = "en_us") => {
  if (languages[locale] && languages[locale][key]) {
    return languages[locale][key];
  }

  const formattedKey = key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

  return formattedKey;
};

const useLanguage = () => {
  const locale = window.localStorage.getItem("locale") || "en_us";

  const translate = (key) => getLabel(key, locale);

  return translate;
};

export default useLanguage;
