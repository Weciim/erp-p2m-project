import useLanguage from "@/locale/useLanguage";
import dayjs from "dayjs";
import { useMoney, useDate } from "@/settings";
import ItemsDataTableModule from "@/modules/ItemsModule/ItemsDataTableModule";

function Items() {
  const translate = useLanguage();
  const entity = "items";
  const searchConfig = {
    entity: "items",
    displayLabels: ["name"],
    searchFields: "name",
  };
  const deleteModalLabels = ["number", "items.name"];

  const { moneyFormatter } = useMoney();
  const { dateFormat } = useDate();

  const dataTableColumns = [
    {
      title: translate("Code"),
      dataIndex: "code",
    },
    {
      title: translate("Name"),
      dataIndex: "name",
    },
    {
      title: translate("Date"),
      dataIndex: "date",
      render: (date) => {
        return dayjs(date).format(dateFormat);
      },
    },

    {
      title: translate("Cost Price"),
      dataIndex: "costPrice",
      onCell: () => {
        return {
          style: {
            textAlign: "right",
            whiteSpace: "nowrap",
            direction: "ltr",
          },
        };
      },
      render: (total, record) => {
        return moneyFormatter({
          amount: total,
          currency_code: record.currency,
        });
      },
    },
    {
      title: translate("Sale Price"),
      dataIndex: "salePrice",
      onCell: () => {
        return {
          style: {
            textAlign: "right",
            whiteSpace: "nowrap",
            direction: "ltr",
          },
        };
      },
      render: (total, record) => {
        return moneyFormatter({
          amount: total,
          currency_code: record.currency,
        });
      },
    },

    {
      title: translate("Type"),
      dataIndex: "type",
    },
  ];
  const Labels = {
    PANEL_TITLE: translate("items"),
    DATATABLE_TITLE: translate("items_list"),
    ADD_NEW_ENTITY: translate("add_new_items"),
    ENTITY_NAME: translate("items"),

    // RECORD_ENTITY: translate("record_payment"),
  };
  const configPage = {
    entity,
    ...Labels,
  };
  const config = {
    ...configPage,
    dataTableColumns,
    searchConfig,
    deleteModalLabels,
  };
  return <ItemsDataTableModule config={config} />;
}

export default Items;
