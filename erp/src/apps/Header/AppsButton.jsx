import { Dropdown, Space } from "antd";
import { useAppContext } from "@/context/appContext";
import { AppstoreOutlined, ShopOutlined } from "@ant-design/icons"; 

const AppsButton = () => {
  const { appContextAction } = useAppContext();

  const handleModuleChange = (appName) => {
    appContextAction.app.open(appName);
  };

  const items = [
    {
      label: (
        <div className="dropDownContainer">
          <div className="dropDownDisplay">
            {/* ERP Box */}
            <div className="box" onClick={() => handleModuleChange("erp")}>
              <AppstoreOutlined className="boxIcon" />
              <p className="boxLabel">ERP</p> 
            </div>

            {/* Inventory Box */}
            <div className="box" onClick={() => handleModuleChange("inventory")}>
              <ShopOutlined className="boxIcon" />
              <p className="boxLabel">Inventory</p> 
            </div>
          </div>
        </div>
      ),
      key: "0",
    },
  ];

  return (
    <Dropdown
      menu={{
        items,
      }}
      trigger={["click"]}
    >
      <a onClick={(e) => e.preventDefault()}>
        <Space>Apps</Space>
      </a>
    </Dropdown>
  );
};

export default AppsButton;