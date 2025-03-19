import { lazy, Suspense } from "react";

import { useSelector } from "react-redux";
import { selectAuth } from "@/redux/auth/selectors";
import { AppContextProvider, useAppContext } from "@/context/appContext";
import PageLoader from "@/components/PageLoader";
import AuthRouter from "@/router/AuthRouter";
import Localization from "@/locale/Localization";

const ErpApp = lazy(() => import("./ErpApp"));
const InventoryApp = lazy(() => import("./InventoryApp"));

const DefaultApp = () => {
  const { state } = useAppContext();
  const { currentApp } = state;
  return (
    <Localization>
      {/* <AppContextProvider> */}
      <Suspense fallback={<PageLoader />}>
        {currentApp === "erp" && <ErpApp />}
        {currentApp === "inventory" && <InventoryApp />}
      </Suspense>
      {/* </AppContextProvider> */}
    </Localization>
  );
};

export default function MainApp() {
  const { isLoggedIn } = useSelector(selectAuth);

  if (!isLoggedIn)
    return (
      <Localization>
        <AuthRouter />
      </Localization>
    );
  else {
    return <DefaultApp />;
  }
}
