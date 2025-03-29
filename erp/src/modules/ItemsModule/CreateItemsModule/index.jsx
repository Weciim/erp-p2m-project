import { ErpLayout } from "@/layout";
import CreateItem from "@/modules/ErpPanelModule/CreateItem";
import ItemsForm from "@/modules/ItemsModule/Forms/ItemsForm.jsx";

export default function CreateInvoiceModule({ config }) {
  return (
    <ErpLayout>
      <CreateItem config={config} CreateForm={ItemsForm} />
    </ErpLayout>
  );
}
