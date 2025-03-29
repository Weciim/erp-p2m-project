import useLanguage from "@/locale/useLanguage";

import { Switch } from "antd";
import { CloseOutlined, CheckOutlined } from "@ant-design/icons";
import CrudModule from "@/modules/CrudModule/CrudModule";
import CategoriesForm from "@/forms/CategoriesForm";

export default function Categories() {
  const translate = useLanguage();
  const entity = "category";
  const searchConfig = {
    displayLabels: ["name"],
    searchFields: "name",
    outputValue: "_id",
  };

  const deleteModalLabels = ["name"];

  const readColumns = [
    {
      title: translate("Name"),
      dataIndex: "name",
    },

    {
      title: translate("Default"),
      dataIndex: "isDefault",
    },
    {
      title: translate("enabled"),
      dataIndex: "enabled",
    },
  ];
  const dataTableColumns = [
    {
      title: translate("Name"),
      dataIndex: "name",
    },
    {
      title: translate("Default"),
      dataIndex: "isDefault",
      key: "isDefault",
      onCell: (record, rowIndex) => {
        return {
          props: {
            style: {
              width: "60px",
            },
          },
        };
      },
      render: (_, record) => {
        return (
          <Switch
            checked={record.isDefault}
            checkedChildren={<CheckOutlined />}
            unCheckedChildren={<CloseOutlined />}
          />
        );
      },
    },
    {
      title: translate("enabled"),
      dataIndex: "enabled",
      key: "enabled",
      onCell: (record, rowIndex) => {
        return {
          props: {
            style: {
              width: "60px",
            },
          },
        };
      },
      render: (_, record) => {
        return (
          <Switch
            checked={record.enabled}
            checkedChildren={<CheckOutlined />}
            unCheckedChildren={<CloseOutlined />}
          />
        );
      },
    },
  ];

  const Labels = {
    PANEL_TITLE: translate("categories"),
    DATATABLE_TITLE: translate("categories_list"),
    ADD_NEW_ENTITY: translate("add_new_tax"),
    ENTITY_NAME: translate("categories"),
  };

  const configPage = {
    entity,
    ...Labels,
  };
  const config = {
    ...configPage,
    readColumns,
    dataTableColumns,
    searchConfig,
    deleteModalLabels,
  };
  return (
    <CrudModule
      createForm={<CategoriesForm />}
      updateForm={<CategoriesForm isUpdateForm={true} />}
      config={config}
    />
  );
}
