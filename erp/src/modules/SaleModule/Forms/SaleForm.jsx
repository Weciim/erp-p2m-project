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
} from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import AutoCompleteAsync from "@/components/AutoCompleteAsync";
import MoneyInputFormItem from "@/components/MoneyInputFormItem";
import { selectFinanceSettings } from "@/redux/settings/selectors";
import { useDate, useMoney } from "@/settings";
import useLanguage from "@/locale/useLanguage";
import calculate from "@/utils/calculate";
import { useSelector } from "react-redux";
import SelectAsync from "@/components/SelectAsync";

export default function SalesForm({ subTotal = 0, current = null }) {
  return <LoadSalesForm subTotal={subTotal} current={current} />;
}

function LoadSalesForm({ subTotal = 0, current = null }) {
  const translate = useLanguage();
  const { dateFormat } = useDate();
  const money = useMoney();
  const { last_sales_number } = useSelector(selectFinanceSettings);
  const [total, setTotal] = useState(0);
  const [taxRate, setTaxRate] = useState(0);
  const [taxTotal, setTaxTotal] = useState(0);
  const [currentYear, setCurrentYear] = useState(() =>
    new Date().getFullYear()
  );
  const [lastNumber, setLastNumber] = useState(() => last_sales_number + 1);

  const handleTaxChange = (value) => {
    setTaxRate(value / 100);
  };

  useEffect(() => {
    if (current) {
      const { taxRate = 0, year, number } = current;
      setTaxRate(taxRate / 100);
      setCurrentYear(year);
      setLastNumber(number);
    }
  }, [current]);

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

  const CustomItemRow = ({ field, remove, current = null }) => {
    const [price, setPrice] = useState(0);
    const [quantity, setQuantity] = useState(0);
    const [rowTotal, setRowTotal] = useState(0);
    useEffect(() => {
      if (current) {
        const { items, invoice } = current;
        const source = invoice ? invoice : items;
        const item = source?.[field.fieldKey];
        if (item) {
          setQuantity(item.quantity);
          setPrice(item.price);
          setRowTotal(calculate.multiply(item.price, item.quantity));
        }
      }
    }, [current, field.fieldKey]);

    useEffect(() => {
      const currentTotal = calculate.multiply(price, quantity);
      setRowTotal(currentTotal);
    }, [price, quantity]);

    return (
      <Row gutter={[12, 12]} style={{ position: "relative", marginBottom: 16 }}>
        <Col className="gutter-row" span={5}>
          <Form.Item
            name={[field.name, "item"]}
            rules={[{ required: true, message: "Please select an item" }]}
          >
            {/* <SelectAsync
              entity="items"
              displayLabels={["code", "name"]}
              outputValue="_id"
              placeholder="Select item"
              withRedirect={true}
              redirectLabel="Add New Item"
              urlToRedirect="/items"
            /> */}
                <AutoCompleteAsync
              entity={"items"}
              displayLabels={["code","name"]}
              outputValue="_id"
              placeholder="Select item"
              searchFields={"code"}
              redirectLabel={"Add New Item"}
              withRedirect
              urlToRedirect={"/items"}
            />
          </Form.Item>
        </Col>
        <Col className="gutter-row" span={7}>
          <Form.Item name={[field.name, "description"]}>
            <Input placeholder="Description" />
          </Form.Item>
        </Col>
        <Col className="gutter-row" span={3}>
          <Form.Item
            name={[field.name, "quantity"]}
            rules={[{ required: true, message: "Quantity is required" }]}
          >
            <InputNumber
              style={{ width: "100%" }}
              min={1}
              onChange={(value) => setQuantity(value || 0)}
            />
          </Form.Item>
        </Col>
        <Col className="gutter-row" span={4}>
          <Form.Item
            name={[field.name, "price"]}
            rules={[{ required: true, message: "Price is required" }]}
          >
            <InputNumber
              style={{ width: "100%" }}
              min={0}
              onChange={(value) => setPrice(value || 0)}
              addonAfter={
                money.currency_position === "after"
                  ? money.currency_symbol
                  : undefined
              }
              addonBefore={
                money.currency_position === "before"
                  ? money.currency_symbol
                  : undefined
              }
            />
          </Form.Item>
        </Col>
        <Col className="gutter-row" span={5}>
          <Form.Item name={[field.name, "total"]}>
            <InputNumber
              readOnly
              style={{ width: "100%" }}
              value={rowTotal}
              addonAfter={
                money.currency_position === "after"
                  ? money.currency_symbol
                  : undefined
              }
              addonBefore={
                money.currency_position === "before"
                  ? money.currency_symbol
                  : undefined
              }
            />
          </Form.Item>
        </Col>
        <div style={{ position: "absolute", right: -30, top: 10 }}>
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => remove(field.name)}
          />
        </div>
      </Row>
    );
  };

  return (
    <>
      <Row gutter={[12, 0]}>
        <Col className="gutter-row" span={8}>
          <Form.Item
            name="client"
            label={translate("Client")}
            rules={[{ required: true }]}
          >
            <AutoCompleteAsync
              entity={"client"}
              displayLabels={["name"]}
              searchFields={"name"}
              redirectLabel={"Add New client"}
              withRedirect
              urlToRedirect={"/client"}
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
            <InputNumber min={1} style={{ width: "100%" }} />
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
                { value: "delivered", label: translate("Delivered") },
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
        <Col className="gutter-row" span={10}>
          <Form.Item label={translate("Notes")} name="notes">
            <Input />
          </Form.Item>
        </Col>
      </Row>

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
              <CustomItemRow
                key={field.key}
                field={field}
                remove={remove}
                current={current}
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
            <p
              style={{
                paddingLeft: "12px",
                paddingTop: "5px",
                margin: 0,
                textAlign: "right",
              }}
            >
              {translate("Sub Total")} :
            </p>
          </Col>
          <Col className="gutter-row" span={5}>
            <MoneyInputFormItem
              readOnly
              value={subTotal}
              addonAfter={
                money.currency_position === "after"
                  ? money.currency_symbol
                  : undefined
              }
              addonBefore={
                money.currency_position === "before"
                  ? money.currency_symbol
                  : undefined
              }
            />
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
            <MoneyInputFormItem
              readOnly
              value={taxTotal}
              addonAfter={
                money.currency_position === "after"
                  ? money.currency_symbol
                  : undefined
              }
              addonBefore={
                money.currency_position === "before"
                  ? money.currency_symbol
                  : undefined
              }
            />
          </Col>
        </Row>
        <Row gutter={[12, -5]}>
          <Col className="gutter-row" span={4} offset={15}>
            <p
              style={{
                paddingLeft: "12px",
                paddingTop: "5px",
                margin: 0,
                textAlign: "right",
              }}
            >
              {translate("Total")} :
            </p>
          </Col>
          <Col className="gutter-row" span={5}>
            <MoneyInputFormItem
              readOnly
              value={total}
              addonAfter={
                money.currency_position === "after"
                  ? money.currency_symbol
                  : undefined
              }
              addonBefore={
                money.currency_position === "before"
                  ? money.currency_symbol
                  : undefined
              }
            />
          </Col>
        </Row>
      </div>
    </>
  );
}
