import "./style/app.css";

import { Suspense, lazy } from "react";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import store from "@/redux/store";
import PageLoader from "@/components/PageLoader";
import { AppContextProvider } from "@/context/appContext";
const MainApp = lazy(() => import("@/apps/MainApp"));

export default function App() {
  return (
    <BrowserRouter>
      <Provider store={store}>
        <AppContextProvider>
          <Suspense fallback={<PageLoader />}>
            <MainApp />
          </Suspense>
        </AppContextProvider>
      </Provider>
    </BrowserRouter>
  );
}
