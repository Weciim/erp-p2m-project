import useLanguage from "@/locale/useLanguage";
import CreatePurchaseModule from "@/modules/PurchaseModule/CreatePurchaseModule";

export default function PurchaseCreate() {
  const entity = "purchase";
  const translate = useLanguage();
  const Labels = {
    PANEL_TITLE: translate("purchase"),
    DATATABLE_TITLE: translate("purchase_list"),
    ADD_NEW_ENTITY: translate("add_new_purchase"),
    ENTITY_NAME: translate("purchase"),

    // RECORD_ENTITY: translate('record_payment'),
  };

  const configPage = {
    entity,
    ...Labels,
  };
  return <CreatePurchaseModule config={configPage} />;
}
