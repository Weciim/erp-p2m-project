import { ErpLayout } from "@/layout";
import ErpPanel from "@/modules/ErpPanelModule";

export default function ItemsDataTableModule({ config }) {
  return (
    <ErpLayout>
      <ErpPanel config={config}></ErpPanel>
    </ErpLayout>
  );
}
