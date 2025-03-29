import { useState, useEffect } from "react";
import {
  Form,
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
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import AutoCompleteAsync from "@/components/AutoCompleteAsync";
import SelectAsync from "@/components/SelectAsync";
import useLanguage from "@/locale/useLanguage";
import { useMoney } from "@/settings";
import { selectItemNumber } from "@/redux/settings/selectors";
import { useSelector } from "react-redux";

const { Option } = Select;
const { TextArea } = Input;

export default function ItemForm({ current = null }) {
  const translate = useLanguage();
  const { moneyFormatter } = useMoney();
  const { last_item_number } = useSelector(selectItemNumber);
  const [form] = Form.useForm();
  const [inventoryEnabled, setInventoryEnabled] = useState(false);
  const [isDigital, setIsDigital] = useState(false);
  const [fileList, setFileList] = useState([]);

  useEffect(() => {
    if (current) {
      form.setFieldsValue({
        ...current,
        category: current.category?._id,
        taxRate: current.taxRate?._id,
        supplier: current.supplier?._id,
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
  };

  const beforeUpload = (file) => {
    const isImage = file.type.startsWith("image/");
    if (!isImage) {
      message.error("You can only upload image files!");
    }
    return isImage;
  };

  const onFinish = (values) => {
    const formData = {
      ...values,
      images: fileList.map((file) => ({
        id: file.uid,
        name: file.name,
        path: file.url || file.thumbUrl,
        description: file.description || "",
      })),
    };
    console.log("Form Data:", formData);
    // Submit to your API here
  };

  return (
    <Form form={form} onFinish={onFinish} layout="vertical">
      <Row gutter={[16, 0]}>
        <Col span={8}>
          <Form.Item
            name="name"
            label={translate("Name")}
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            name="code"
            label={translate("Code")}
            rules={[{ required: true }]}
          >
            <Input disabled={!!current} />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item name="barcode" label={translate("Barcode")}>
            <Input />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item name="description" label={translate("Description")}>
        <TextArea rows={3} />
      </Form.Item>

      <Divider orientation="left">{translate("Classification")}</Divider>
      <Row gutter={[16, 0]}>
        <Col span={8}>
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
        <Col span={8}>
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
        <Col span={8}>
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
        <Col span={8}>
          <Form.Item name="costPrice" label={translate("Cost Price")}>
            <InputNumber
              style={{ width: "100%" }}
              formatter={(value) => moneyFormatter(value)}
              parser={(value) => value.replace(/[^\d.]/g, "")}
            />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            name="salePrice"
            label={translate("Sale Price")}
            rules={[{ required: true }]}
          >
            <InputNumber
              style={{ width: "100%" }}
              formatter={(value) => moneyFormatter(value)}
              parser={(value) => value.replace(/[^\d.]/g, "")}
            />
          </Form.Item>
        </Col>
        <Col span={8}>
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
        <Col span={8}>
          <Form.Item
            name="inventoryEnabled"
            label={translate("Track Inventory")}
            valuePropName="checked"
          >
            <Switch onChange={handleInventoryToggle} />
          </Form.Item>
        </Col>
        {inventoryEnabled && (
          <>
            <Col span={8}>
              <Form.Item name="quantity" label={translate("Quantity")}>
                <InputNumber style={{ width: "100%" }} min={0} />
              </Form.Item>
            </Col>
            <Col span={8}>
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

      <Divider orientation="left">{translate("Digital Product")}</Divider>
      <Row gutter={[16, 0]}>
        <Col span={8}>
          <Form.Item
            name="isDigital"
            label={translate("Is Digital Product")}
            valuePropName="checked"
          >
            <Switch onChange={handleDigitalToggle} />
          </Form.Item>
        </Col>
        {isDigital && (
          <Col span={16}>
            <Form.Item name="downloadUrl" label={translate("Download URL")}>
              <Input />
            </Form.Item>
          </Col>
        )}
      </Row>

      <Divider />
      <Form.Item>
        <Button type="primary" htmlType="submit">
          {translate("Save")}
        </Button>
      </Form.Item>
    </Form>
  );
}
