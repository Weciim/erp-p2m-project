import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button, Drawer, Layout, Menu } from "antd";

import { useAppContext } from "@/context/appContext";

import useLanguage from "@/locale/useLanguage";
import logoIcon from "@/style/images/logo.png";
import logoText from "@/style/images/logo-text-mod.png";

import useResponsive from "@/hooks/useResponsive";

import {
  SettingOutlined,
  CustomerServiceOutlined,
  ContainerOutlined,
  FileSyncOutlined,
  DashboardOutlined,
  CreditCardOutlined,
  MenuOutlined,
  ShopOutlined,
  WalletOutlined,
  ReconciliationOutlined,
  DollarOutlined,
  ShoppingCartOutlined,
  DropboxOutlined,
} from "@ant-design/icons";

const { Sider } = Layout;

export default function Navigation() {
  const { isMobile } = useResponsive();

  return isMobile ? <MobileSidebar /> : <Sidebar collapsible={false} />;
}

function Sidebar({ collapsible, isMobile = false }) {
  let location = useLocation();

  const { state: stateApp, appContextAction } = useAppContext();
  const { isNavMenuClose, currentApp } = stateApp;
  const { navMenu } = appContextAction;
  const [showLogoApp, setLogoApp] = useState(isNavMenuClose);
  const [currentPath, setCurrentPath] = useState(location.pathname.slice(1));

  const translate = useLanguage();
  const navigate = useNavigate();

  const menuItems = {
    erp: [
      {
        key: "dashboard",
        icon: <DashboardOutlined />,
        label: <Link to={"/"}>{translate("dashboard")}</Link>,
      },
      {
        key: "customer",
        icon: <CustomerServiceOutlined />,
        label: <Link to={"/customer"}>{translate("customers")}</Link>,
      },
      {
        key: "invoice",
        icon: <ContainerOutlined />,
        label: <Link to={"/invoice"}>{translate("invoices")}</Link>,
      },
      {
        key: "quote",
        icon: <FileSyncOutlined />,
        label: <Link to={"/quote"}>{translate("quote")}</Link>,
      },
      {
        key: "payment",
        icon: <CreditCardOutlined />,
        label: <Link to={"/payment"}>{translate("payments")}</Link>,
      },
      {
        key: "paymentMode",
        label: <Link to={"/payment/mode"}>{translate("payments_mode")}</Link>,
        icon: <WalletOutlined />,
      },
      {
        key: "taxes",
        label: <Link to={"/taxes"}>{translate("taxes")}</Link>,
        icon: <ShopOutlined />,
      },
      {
        key: "generalSettings",
        label: <Link to={"/settings"}>{translate("settings")}</Link>,
        icon: <SettingOutlined />,
      },
    ],
    inventory: [
      {
        key: "purchase",
        label: <Link to={"/purchase"}>{translate("purchase")}</Link>,
        icon: <DollarOutlined />,
      },
      {
        key: "sales",
        label: <Link to={"/sale"}>{translate("sales")}</Link>,
        icon: <ShoppingCartOutlined />,
      },
      {
        key: "items",
        label: <Link to={"/items"}>{translate("items")}</Link>,
        icon: <DropboxOutlined />,
      },
    ],
  };

  useEffect(() => {
    const savedApp = localStorage.getItem("currentApp");
    if (savedApp && savedApp !== currentApp) {
      appContextAction.app.open(savedApp);
    }
  }, []);

  useEffect(() => {
    if (location) {
      if (currentPath !== location.pathname) {
        if (location.pathname === "/") {
          setCurrentPath("dashboard");
        } else {
          setCurrentPath(location.pathname.slice(1));
        }
      }
    }
  }, [location, currentPath]);

  useEffect(() => {
    if (isNavMenuClose) {
      setLogoApp(isNavMenuClose);
    }
    const timer = setTimeout(() => {
      if (!isNavMenuClose) {
        setLogoApp(isNavMenuClose);
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [isNavMenuClose]);

  const onCollapse = () => {
    navMenu.collapse();
  };

  return (
    <Sider
      collapsible={collapsible}
      collapsed={collapsible ? isNavMenuClose : collapsible}
      onCollapse={onCollapse}
      className="navigation"
      width={256}
      style={{
        overflow: "hidden",
        height: "100vh",
        position: isMobile ? "absolute" : "relative",
        bottom: "20px",
        ...(!isMobile && {
          left: "20px",
          top: "20px",
          backgroundColor: "#f9fafc",
        }),
      }}
    >
      <div
        className="logo"
        onClick={() => navigate("/")}
        style={{
          cursor: "pointer",
        }}
      >
        <img
          src={logoIcon}
          alt="Logo"
          style={{ marginLeft: "-5px", height: "40px" }}
        />

        {!showLogoApp && (
          <img
            src={logoText}
            alt="Logo"
            style={{
              marginTop: "3px",
              marginLeft: "10px",
              height: "38px",
            }}
          />
        )}
      </div>
      <Menu
        items={menuItems[currentApp] || menuItems.erp} 
        mode="inline"
        selectedKeys={[currentPath]}
        style={{
          width: 256,
          backgroundColor: "#f9fafc",
        }}
      />
    </Sider>
  );
}

function MobileSidebar() {
  const [visible, setVisible] = useState(false);
  const showDrawer = () => {
    setVisible(true);
  };
  const onClose = () => {
    setVisible(false);
  };

  return (
    <>
      <Button
        type="text"
        size="large"
        onClick={showDrawer}
        className="mobile-sidebar-btn"
        style={{ marginLeft: 25 }}
      >
        <MenuOutlined style={{ fontSize: 18 }} />
      </Button>
      <Drawer
        width={250}
        placement={"left"}
        closable={false}
        onClose={onClose}
        open={visible}
      >
        <Sidebar collapsible={false} isMobile={true} />
      </Drawer>
    </>
  );
}