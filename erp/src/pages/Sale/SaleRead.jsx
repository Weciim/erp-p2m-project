import useLanguage from "@/locale/useLanguage";
import ReadSaleModule from "@/modules/SaleModule/ReadSaleModule";

export default function SaleRead() {
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
  return <ReadSaleModule config={configPage} />;
}
