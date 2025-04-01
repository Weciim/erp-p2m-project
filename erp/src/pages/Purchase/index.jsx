import useLanguage from "@/locale/useLanguage";
import dayjs from "dayjs";
import { useMoney, useDate } from "@/settings";
import PurchaseDataTableModule from "@/modules/PurchaseModule/PurchaseDataTableModule";

function Purchase() {
  const translate = useLanguage();
  const entity = "purchase";
  const searchConfig = {
    entity: "purchase",
    displayLabels: ["name"],
    searchFields: "name",
  };
  const deleteModalLabels = ["number", "purchase.name"];

  const { moneyFormatter } = useMoney();
  const { dateFormat } = useDate();

  const dataTableColumns = [
    {
      title: translate("Number"),
      dataIndex: "number",
    },
  
    {
      title: translate("Date"),
      dataIndex: "date",
      render: (date) => {
        return dayjs(date).format(dateFormat);
      },
    },

    {
      title: translate("Total"),
      dataIndex: "total",
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
      title: translate("Status"),
      dataIndex: "status",
    },
    {
      title: translate("Payment"),
      dataIndex: "paymentStatus",
    },
  ];
  const Labels = {
    PANEL_TITLE: translate("purchase"),
    DATATABLE_TITLE: translate("purchase_list"),
    ADD_NEW_ENTITY: translate("add_new_purchase"),
    ENTITY_NAME: translate("purchase"),

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
  return <PurchaseDataTableModule config={config} />;
}

export default Purchase;
