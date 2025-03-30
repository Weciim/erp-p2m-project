import { useState, useEffect } from "react";
import {
  Input,
  InputNumber,
  Button,
  Select,
  Divider,
  Row,
  Col,
  Switch,
  Upload,
  message,
  Form,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import AutoCompleteAsync from "@/components/AutoCompleteAsync";
import SelectAsync from "@/components/SelectAsync";
import useLanguage from "@/locale/useLanguage";
import { useMoney } from "@/settings";
import { selectFinanceSettings } from "@/redux/settings/selectors";
import { useSelector } from "react-redux";

const { Option } = Select;
const { TextArea } = Input;

export default function ItemsForm({ current = null }) {
  const translate = useLanguage();
  const moneyUtils = useMoney();
  const { last_item_number } = useSelector(selectFinanceSettings);
  const [inventoryEnabled, setInventoryEnabled] = useState(false);
  const [isDigital, setIsDigital] = useState(false);
  const [fileList, setFileList] = useState([]);
  const form = Form.useFormInstance();

  const moneyParser = (value) => {
    if (!value) return 0;
    if (typeof value === 'number') return value;
    const parsed = value.toString().replace(/[^0-9.-]/g, '');
    return parsed ? Number(parsed) : 0;
  };

  const moneyFormatter = (value) => {
    return moneyUtils?.moneyFormatter 
      ? moneyUtils.moneyFormatter({ amount: value || 0 })
      : value?.toLocaleString() || '0';
  };

  useEffect(() => {
    if (current) {
      form.setFieldsValue({
        ...current,
        category: current.category?._id,
        taxRate: current.taxRate?._id,
        supplier: current.supplier?._id,
        costPrice: current.costPrice || 0,
        salePrice: current.salePrice || 0,
      });
      setInventoryEnabled(current.inventoryEnabled || false);
      setIsDigital(current.isDigital || false);
      if (current.images) {
        setFileList(
          current.images.map((img) => ({
            uid: img.id,
            name: img.name,
            status: "done",
            url: img.path,
          }))
        );
      }
    } else {
      form.setFieldsValue({
        code: `ITM-${(last_item_number + 1).toString().padStart(4, "0")}`,
        type: "product",
        unit: "piece",
        inventoryEnabled: false,
        lowStockThreshold: 5,
        costPrice: 0,
        salePrice: 0,
      });
    }
  }, [current, form, last_item_number]);

  const handleInventoryToggle = (checked) => {
    setInventoryEnabled(checked);
    form.setFieldsValue({ inventoryEnabled: checked });
  };

  const handleDigitalToggle = (checked) => {
    setIsDigital(checked);
    form.setFieldsValue({ isDigital: checked });
  };

  const handleUploadChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
    form.setFieldsValue({
      images: newFileList.map((file) => ({
        id: file.uid,
        name: file.name,
        path: file.url || file.thumbUrl,
        description: file.description || "",
      })),
    });
  };

  const beforeUpload = (file) => {
    const isImage = file.type.startsWith("image/");
    if (!isImage) {
      message.error("You can only upload image files!");
    }
    return isImage;
  };

  return (
    <>
      <Row gutter={[16, 0]}>
        <Col className="gutter-row" span={8}>
          <Form.Item
            name="name"
            label={translate("Name")}
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
        </Col>
        <Col className="gutter-row" span={8}>
          <Form.Item
            name="code"
            label={translate("Code")}
            rules={[{ required: true }]}
          >
            <Input disabled={!!current} />
          </Form.Item>
        </Col>
        <Col className="gutter-row" span={8}>
          <Form.Item name="barcode" label={translate("Barcode")}>
            <Input />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={[16, 0]}>
        <Col className="gutter-row" span={24}>
          <Form.Item name="description" label={translate("Description")}>
            <TextArea rows={3} />
          </Form.Item>
        </Col>
      </Row>

      <Divider orientation="left">{translate("Classification")}</Divider>
      <Row gutter={[16, 0]}>
        <Col className="gutter-row" span={8}>
          <Form.Item
            name="type"
            label={translate("Type")}
            rules={[{ required: true }]}
          >
            <Select>
              <Option value="product">{translate("Product")}</Option>
              <Option value="service">{translate("Service")}</Option>
              <Option value="digital">{translate("Digital")}</Option>
              <Option value="bundle">{translate("Bundle")}</Option>
            </Select>
          </Form.Item>
        </Col>
        <Col className="gutter-row" span={8}>
          <Form.Item name="category" label={translate("Category")}>
            <SelectAsync
              entity="category"
              displayLabels={["name"]}
              searchFields="name"
              redirectLabel={translate("Add New Category")}
              withRedirect
              urlToRedirect="/categories"
            />
          </Form.Item>
        </Col>
        <Col className="gutter-row" span={8}>
          <Form.Item name="unit" label={translate("Unit")}>
            <Select>
              <Option value="piece">{translate("Piece")}</Option>
              <Option value="kg">{translate("Kilogram")}</Option>
              <Option value="liter">{translate("Liter")}</Option>
              <Option value="meter">{translate("Meter")}</Option>
              <Option value="box">{translate("Box")}</Option>
              <Option value="pack">{translate("Pack")}</Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Divider orientation="left">{translate("Pricing")}</Divider>
      <Row gutter={[16, 0]}>
        <Col className="gutter-row" span={8}>
          <Form.Item name="costPrice" label={translate("Cost Price")}>
            <InputNumber
              style={{ width: "100%" }}
              min={0}
              formatter={moneyFormatter}
              parser={moneyParser}
            />
          </Form.Item>
        </Col>
        <Col className="gutter-row" span={8}>
          <Form.Item
            name="salePrice"
            label={translate("Sale Price")}
            rules={[{ required: true }]}
          >
            <InputNumber
              style={{ width: "100%" }}
              min={0}
              formatter={moneyFormatter}
              parser={moneyParser}
            />
          </Form.Item>
        </Col>
        <Col className="gutter-row" span={8}>
          <Form.Item name="taxRate" label={translate("Tax Rate")}>
            <SelectAsync
              entity="taxes"
              displayLabels={["taxName"]}
              outputValue="taxValue"
              redirectLabel={translate("Add New Tax")}
              withRedirect
              urlToRedirect="/taxes"
            />
          </Form.Item>
        </Col>
      </Row>

      <Divider orientation="left">{translate("Inventory")}</Divider>
      <Row gutter={[16, 0]}>
        <Col className="gutter-row" span={8}>
          <Form.Item
            name="inventoryEnabled"
            label={translate("Track Inventory")}
            valuePropName="checked"
          >
            <Switch onChange={handleInventoryToggle} checked={inventoryEnabled} />
          </Form.Item>
        </Col>
        {inventoryEnabled && (
          <>
            <Col className="gutter-row" span={8}>
              <Form.Item name="quantity" label={translate("Quantity")}>
                <InputNumber style={{ width: "100%" }} min={0} />
              </Form.Item>
            </Col>
            <Col className="gutter-row" span={8}>
              <Form.Item
                name="lowStockThreshold"
                label={translate("Low Stock Threshold")}
              >
                <InputNumber style={{ width: "100%" }} min={0} />
              </Form.Item>
            </Col>
          </>
        )}
      </Row>

      <Divider orientation="left">{translate("Supplier")}</Divider>
      <Row gutter={[16, 0]}>
        <Col className="gutter-row" span={24}>
          <Form.Item name="supplier" label={translate("Supplier")}>
            <AutoCompleteAsync
              entity="client"
              displayLabels={["name"]}
              searchFields="name"
              redirectLabel={translate("Add New Supplier")}
              withRedirect
              urlToRedirect="/suppliers"
            />
          </Form.Item>
        </Col>
      </Row>

      <Divider orientation="left">{translate("Digital Product")}</Divider>
      <Row gutter={[16, 0]}>
        <Col className="gutter-row" span={8}>
          <Form.Item
            name="isDigital"
            label={translate("Is Digital Product")}
            valuePropName="checked"
          >
            <Switch onChange={handleDigitalToggle} checked={isDigital} />
          </Form.Item>
        </Col>
        {isDigital && (
          <Col className="gutter-row" span={16}>
            <Form.Item name="downloadUrl" label={translate("Download URL")}>
              <Input />
            </Form.Item>
          </Col>
        )}
      </Row>

      <Divider orientation="left">{translate("Images")}</Divider>
      <Row gutter={[16, 0]}>
        <Col className="gutter-row" span={24}>
          <Form.Item name="images">
            <Upload
              listType="picture-card"
              fileList={fileList}
              onChange={handleUploadChange}
              beforeUpload={beforeUpload}
              multiple
            >
              <Button icon={<UploadOutlined />}>{translate("Upload")}</Button>
            </Upload>
          </Form.Item>
        </Col>
      </Row>
    </>
  );
}