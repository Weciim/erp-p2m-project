import { ErpLayout } from "@/layout";
import CreateItem from "@/modules/ErpPanelModule/CreateItem";
import PurchaseForm from "@/modules/SaleModule/Forms/SaleForm.jsx";

export default function CreateInvoiceModule({ config }) {
  return (
    <ErpLayout>
      <CreateItem config={config} CreateForm={PurchaseForm} />
    </ErpLayout>
  );
}
