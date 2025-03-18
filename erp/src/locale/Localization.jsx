import { ConfigProvider } from "antd";
import antdLocale from "./antdLocale";
import useLanguage from "./useLanguage";
import { useEffect, useState } from "react";

export default function Localization({ children }) {
  const translate = useLanguage();
  const [locale, setLocale] = useState(window.localStorage.getItem("locale") || "en_us");

  useEffect(() => {
    document.documentElement.dir = locale === "ar_AR" ? "rtl" : "ltr";
  }, [locale]);

  return (
    <ConfigProvider
      locale={antdLocale[locale]}
      theme={{
        token: {
          colorPrimary: "#339393",
          colorLink: "#1640D6",
          borderRadius: 0,
        },
      }}
    >
      {children}
    </ConfigProvider>
  );
}
