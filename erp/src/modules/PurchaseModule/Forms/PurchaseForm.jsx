import { useState, useEffect, useRef } from "react";
import dayjs from "dayjs";
import {
  Form,
  Input,
  InputNumber,
  Button,
  Select,
  Divider,
  Row,
  Col,
  DatePicker,
  Switch,
  message,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import AutoCompleteAsync from "@/components/AutoCompleteAsync";
import ItemRow from "@/modules/ErpPanelModule/ItemRow";
import MoneyInputFormItem from "@/components/MoneyInputFormItem";
import { selectFinanceSettings } from "@/redux/settings/selectors";
import { useDate } from "@/settings";
import useLanguage from "@/locale/useLanguage";
import calculate from "@/utils/calculate";
import { useSelector } from "react-redux";
import SelectAsync from "@/components/SelectAsync";

export default function PurchaseForm({ subTotal = 0, current = null }) {
  return <LoadPurchaseForm subTotal={subTotal} current={current} />;
}

function LoadPurchaseForm({ subTotal = 0, current = null }) {
  const translate = useLanguage();
  const { dateFormat } = useDate();
  const { last_item_number } = useSelector(selectFinanceSettings);
  const [total, setTotal] = useState(0);
  const [taxRate, setTaxRate] = useState(0);
  const [taxTotal, setTaxTotal] = useState(0);
  const [currentYear, setCurrentYear] = useState(() => new Date().getFullYear());
  const [lastNumber, setLastNumber] = useState(() => {
    // Use last_item_number + 1 as the starting point for purchase numbers
    return typeof last_item_number === 'number' ? last_item_number + 1 : 1;
  });
  const [createNewItems, setCreateNewItems] = useState(false);
  const form = Form.useFormInstance();

  const handleTaxChange = (value) => {
    setTaxRate(value / 100);
  };

  const handleCreateNewItemsToggle = (checked) => {
    setCreateNewItems(checked);
  };

  useEffect(() => {
    if (current) {
      const { taxRate = 0, year, number } = current;
      setTaxRate(taxRate / 100);
      setCurrentYear(year);
      setLastNumber(number);
    } else {
      // Initialize with last_item_number + 1 if creating new purchase
      setLastNumber(prev => {
        const baseNumber = typeof last_item_number === 'number' ? last_item_number : 0;
        return baseNumber + 1;
      });
    }
  }, [current, last_item_number]);

  useEffect(() => {
    const currentTotal = calculate.add(
      calculate.multiply(subTotal, taxRate),
      subTotal
    );
    setTaxTotal(Number.parseFloat(calculate.multiply(subTotal, taxRate)));
    setTotal(Number.parseFloat(currentTotal));
  }, [subTotal, taxRate]);

  const addField = useRef(false);

  useEffect(() => {
    addField.current.click();
  }, []);

  const handleItemAdd = (newItem) => {
    if (createNewItems) {
      // Prepare item data for creation
      const itemData = {
        name: newItem.itemName,
        description: newItem.description || '',
        type: 'product',
        unit: 'piece',
        costPrice: newItem.price,
        salePrice: calculate.multiply(newItem.price, 1.2),
        quantity: newItem.quantity,
        inventoryEnabled: true,
        supplier: form.getFieldValue('supplier'),
      };
      message.success(`Item ${newItem.itemName} will be created`);
    }
  };

  return (
    <>
      <Row gutter={[12, 0]}>
        <Col className="gutter-row" span={8}>
          <Form.Item
            name="supplier"
            label={translate("Supplier")}
            rules={[{ required: true }]}
          >
            <AutoCompleteAsync
              entity={"client"}
              displayLabels={["name"]}
              searchFields={"name"}
              redirectLabel={"Add New Supplier"}
              withRedirect
              urlToRedirect={"/supplier"}
            />
          </Form.Item>
        </Col>
        <Col className="gutter-row" span={3}>
          <Form.Item
            label={translate("Number")}
            name="number"
            initialValue={lastNumber}
            rules={[{ required: true }]}
          >
            <InputNumber 
              min={1} 
              style={{ width: "100%" }} 
              disabled={!!current} // Disable editing for existing purchases
            />
          </Form.Item>
        </Col>
        <Col className="gutter-row" span={3}>
          <Form.Item
            label={translate("Year")}
            name="year"
            initialValue={currentYear}
            rules={[{ required: true }]}
          >
            <InputNumber style={{ width: "100%" }} />
          </Form.Item>
        </Col>
        <Col className="gutter-row" span={5}>
          <Form.Item
            label={translate("Status")}
            name="status"
            initialValue={"draft"}
          >
            <Select
              options={[
                { value: "draft", label: translate("Draft") },
                { value: "pending", label: translate("Pending") },
                { value: "approved", label: translate("Approved") },
                { value: "received", label: translate("Received") },
                { value: "cancelled", label: translate("Cancelled") },
                { value: "on hold", label: translate("On hold") },
              ]}
            />
          </Form.Item>
        </Col>
        <Col className="gutter-row" span={8}>
          <Form.Item
            name="date"
            label={translate("Date")}
            rules={[{ required: true, type: "object" }]}
            initialValue={dayjs()}
          >
            <DatePicker style={{ width: "100%" }} format={dateFormat} />
          </Form.Item>
        </Col>
        <Col className="gutter-row" span={24}>
          <Form.Item
            name="createNewItems"
            label={translate("Create New Items")}
            valuePropName="checked"
          >
            <Switch 
              onChange={handleCreateNewItemsToggle} 
              checked={createNewItems} 
            />
          </Form.Item>
        </Col>
      </Row>

      {/* Rest of your form components remain the same */}
      <Divider dashed />
      <Row gutter={[12, 12]} style={{ position: "relative" }}>
        <Col className="gutter-row" span={5}>
          <p>{translate("Item")}</p>
        </Col>
        <Col className="gutter-row" span={7}>
          <p>{translate("Description")}</p>
        </Col>
        <Col className="gutter-row" span={3}>
          <p>{translate("Quantity")}</p>
        </Col>
        <Col className="gutter-row" span={4}>
          <p>{translate("Price")}</p>
        </Col>
        <Col className="gutter-row" span={5}>
          <p>{translate("Total")}</p>
        </Col>
      </Row>

      <Form.List name="items">
        {(fields, { add, remove }) => (
          <>
            {fields.map((field) => (
              <ItemRow
                key={field.key}
                remove={remove}
                field={field}
                current={current}
                createNewItems={createNewItems}
                onItemAdd={handleItemAdd}
              />
            ))}
            <Form.Item>
              <Button
                type="dashed"
                onClick={() => add()}
                block
                icon={<PlusOutlined />}
                ref={addField}
              >
                {translate("Add Item")}
              </Button>
            </Form.Item>
          </>
        )}
      </Form.List>

      <Divider dashed />
      <div style={{ position: "relative", width: "100%", float: "right" }}>
        <Row gutter={[12, -5]}>
          <Col className="gutter-row" span={5}>
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                icon={<PlusOutlined />}
                block
              >
                {translate("Save")}
              </Button>
            </Form.Item>
          </Col>
          <Col className="gutter-row" span={4} offset={10}>
            <p style={{ paddingLeft: "12px", paddingTop: "5px", margin: 0, textAlign: "right" }}>
              {translate("Sub Total")} :
            </p>
          </Col>
          <Col className="gutter-row" span={5}>
            <MoneyInputFormItem readOnly value={subTotal} />
          </Col>
        </Row>
        <Row gutter={[12, -5]}>
          <Col className="gutter-row" span={4} offset={15}>
            <Form.Item name="taxRate" rules={[{ required: true }]}>
              <SelectAsync
                value={taxRate}
                onChange={handleTaxChange}
                entity={"taxes"}
                outputValue={"taxValue"}
                displayLabels={["taxName"]}
                withRedirect={true}
                urlToRedirect="/taxes"
                redirectLabel={translate("Add New Tax")}
                placeholder={translate("Select Tax Value")}
              />
            </Form.Item>
          </Col>
          <Col className="gutter-row" span={5}>
            <MoneyInputFormItem readOnly value={taxTotal} />
          </Col>
        </Row>
        <Row gutter={[12, -5]}>
          <Col className="gutter-row" span={4} offset={15}>
            <p style={{ paddingLeft: "12px", paddingTop: "5px", margin: 0, textAlign: "right" }}>
              {translate("Total")} :
            </p>
          </Col>
          <Col className="gutter-row" span={5}>
            <MoneyInputFormItem readOnly value={total} />
          </Col>
        </Row>
      </div>
    </>
  );
}