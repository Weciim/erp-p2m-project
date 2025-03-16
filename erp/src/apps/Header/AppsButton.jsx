import { Dropdown, Space } from "antd";
const items = [
  {
    label: (
      <div className="dropDownContainer">
        <div className="dropDownDisplay">
          <p>Finance</p>
          <p>Finance</p>
          <p>Finance</p>
          <p>Finance</p>
        </div>
      </div>
    ),
    key: "0",
  },
];
const AppsButton = () => (
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
export default AppsButton;
