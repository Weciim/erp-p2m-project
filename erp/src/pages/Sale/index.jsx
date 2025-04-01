import useLanguage from "@/locale/useLanguage";
import dayjs from "dayjs";
import { useMoney, useDate } from "@/settings";
import SaleDataTableModule from "@/modules/SaleModule/SaleDataTableModule";

function Sale() {
  const translate = useLanguage();
  const entity = "sale";
  const searchConfig = {
    entity: "sale",
    displayLabels: ["name"],
    searchFields: "name",
  };
  const deleteModalLabels = ["number", "sale.name"];

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
    PANEL_TITLE: translate("sale"),
    DATATABLE_TITLE: translate("sale_list"),
    ADD_NEW_ENTITY: translate("add_new_sale"),
    ENTITY_NAME: translate("sale"),

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
  return <SaleDataTableModule config={config} />;
}

export default Sale;
