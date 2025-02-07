import { lazy, Suspense, useEffect, useState } from "react";

import { useSelector } from "react-redux";
import { selectAuth } from "@/redux/auth/selectors";
import { AppContextProvider } from "@/context/appContext";
import PageLoader from "@/components/PageLoader";
import AuthRouter from "@/router/AuthRouter";
import Localization from "@/locale/Localization";
import { notification } from "antd";

const ErpApp = lazy(() => import("./ErpApp"));

const DefaultApp = () => (
  <Localization>
    <AppContextProvider>
      <Suspense fallback={<PageLoader />}>
        <ErpApp />
      </Suspense>
    </AppContextProvider>
  </Localization>
);

export default function MainApp() {
  const { isLoggedIn } = useSelector(selectAuth);

  if (!isLoggedIn)
    return (
      // <Localization>
      //   <AuthRouter />
      // </Localization>
      <DefaultApp />
    );
  else {
    return <DefaultApp />;
  }
}
