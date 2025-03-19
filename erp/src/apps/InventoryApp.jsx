import { Layout } from "antd";
import HeaderContent from "@/apps/Header/HeaderContainer";
import Navigation from "@/apps/Navigation/NavigationContainer";
import AppRouter from "@/router/AppRouter";
import useResponsive from "@/hooks/useResponsive";

const { Content } = Layout;

export default function InventoryApp() {
  const { isMobile } = useResponsive();

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
            <h1>hello</h1>
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
            <h1>hello</h1>
          </Content>
        </Layout>
      )}
    </Layout>
  );
}
