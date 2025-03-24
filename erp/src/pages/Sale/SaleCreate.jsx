import useLanguage from "@/locale/useLanguage";
import CreateSaleModule from "@/modules/SaleModule/CreateSaleModule";

export default function SaleCreate() {
  const entity = "sale";
  const translate = useLanguage();
  const Labels = {
    PANEL_TITLE: translate("sale"),
    DATATABLE_TITLE: translate("sale_list"),
    ADD_NEW_ENTITY: translate("add_new_sale"),
    ENTITY_NAME: translate("sale"),

    // RECORD_ENTITY: translate('record_payment'),
  };

  const configPage = {
    entity,
    ...Labels,
  };
  return <CreateSaleModule config={configPage} />;
}
