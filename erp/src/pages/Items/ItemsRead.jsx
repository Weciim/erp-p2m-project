import useLanguage from '@/locale/useLanguage';
import ReadItemsModule from '@/modules/ItemsModule/ReadItemsModule';

export default function InvoiceRead() {
  const entity = 'items';
  const translate = useLanguage();
  const Labels = {
    PANEL_TITLE: translate('items'),
    DATATABLE_TITLE: translate('items_list'),
    ADD_NEW_ENTITY: translate('add_new_items'),
    ENTITY_NAME: translate('items'),

    // RECORD_ENTITY: translate('record_payment'),
  };

  const configPage = {
    entity,
    ...Labels,
  };
  return <ReadItemsModule config={configPage} />;
}
