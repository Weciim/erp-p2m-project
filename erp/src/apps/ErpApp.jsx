import { useLayoutEffect } from "react";

import { useDispatch, useSelector } from "react-redux";

import { Layout } from "antd";

import Navigation from "@/apps/Navigation/NavigationContainer";

import HeaderContent from "@/apps/Header/HeaderContainer";
import PageLoader from "@/components/PageLoader";

import { settingsAction } from "@/redux/settings/actions";

import { selectSettings } from "@/redux/settings/selectors";

import AppRouter from "@/router/AppRouter";

import useResponsive from "@/hooks/useResponsive";

export default function ErpCrmApp() {
  const { Content } = Layout;

  const { isMobile } = useResponsive();

  const dispatch = useDispatch();

  useLayoutEffect(() => {
    dispatch(settingsAction.list({ entity: "setting" }));
  }, []);

  // const { isSuccess: settingIsloaded } = useSelector(selectSettings);
  const settingIsloaded = true;
  if (settingIsloaded)
    return (
      <Layout hasSider>
        <Navigation />

        {isMobile ? (
          <Layout style={{ marginLeft: 0 }}>
            <HeaderContent />
            <Content
              style={{
                margin: "40px auto 30px",
                overflow: "initial",
                width: "100%",
                padding: "0 25px",
                maxWidth: "none",
              }}
            >
              <AppRouter />
            </Content>
          </Layout>
        ) : (
          <Layout>
            <HeaderContent />
            <Content
              style={{
                margin: "40px auto 30px",
                overflow: "initial",
                width: "100%",
                padding: "0 50px",
                maxWidth: 1400,
              }}
            >
              <AppRouter />
            </Content>
          </Layout>
        )}
      </Layout>
    );
  else return <PageLoader />;
}
