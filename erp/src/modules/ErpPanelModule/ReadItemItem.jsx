import { useState, useEffect } from "react";
import { Divider, Descriptions, Statistic, Tag, Row, Col, Button } from "antd";
import { PageHeader } from "@ant-design/pro-layout";
import {
  EditOutlined,
  FilePdfOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";

import { useSelector, useDispatch } from "react-redux";
import useLanguage from "@/locale/useLanguage";
import { erp } from "@/redux/erp/actions";

import { generate as uniqueId } from "shortid";
import { selectCurrentItem } from "@/redux/erp/selectors";
import { DOWNLOAD_BASE_URL } from "@/config/serverApiConfig";
import { useMoney } from "@/settings";
import { useNavigate } from "react-router-dom";

export default function ReadItem({ config, selectedItem }) {
  const translate = useLanguage();
  const { entity, ENTITY_NAME } = config;
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { moneyFormatter } = useMoney();

  const { result: currentResult } = useSelector(selectCurrentItem);
  const [currentItem, setCurrentItem] = useState(selectedItem || {});

  useEffect(() => {
    if (currentResult) {
      setCurrentItem(currentResult);
    }
  }, [currentResult]);

  return (
    <>
      <PageHeader
        onBack={() => {
          navigate(`/${entity.toLowerCase()}`);
        }}
        title={`${ENTITY_NAME} # ${currentItem.code || ''}`}
        ghost={false}
        tags={[
          <Tag color={currentItem.inventoryEnabled ? "green" : "orange"} key="status">
            {translate(currentItem.inventoryEnabled ? "Tracked" : "Not Tracked")}
          </Tag>,
          <Tag color={currentItem.isDigital ? "blue" : "purple"} key="type">
            {translate(currentItem.type || 'product')}
          </Tag>
        ]}
        extra={[
          <Button
            key={`${uniqueId()}`}
            onClick={() => {
              navigate(`/${entity.toLowerCase()}`);
            }}
            icon={<CloseCircleOutlined />}
          >
            {translate("Close")}
          </Button>,
          <Button
            key={`${uniqueId()}`}
            onClick={() => {
              window.open(
                `${DOWNLOAD_BASE_URL}${entity}/${entity}-${currentItem._id}.pdf`,
                "_blank"
              );
            }}
            icon={<FilePdfOutlined />}
          >
            {translate("Download PDF")}
          </Button>,
          <Button
            key={`${uniqueId()}`}
            onClick={() => {
              dispatch(
                erp.currentAction({
                  actionType: "update",
                  data: currentItem,
                })
              );
              navigate(`/${entity.toLowerCase()}/update/${currentItem._id}`);
            }}
            type="primary"
            icon={<EditOutlined />}
          >
            {translate("Edit")}
          </Button>,
        ]}
        style={{
          padding: "20px 0px",
        }}
      >
        <Row>
          <Statistic 
            title={translate("Cost Price")} 
            value={moneyFormatter({
              amount: currentItem.costPrice || 0,
            })}
          />
          <Statistic
            title={translate("Sale Price")}
            value={moneyFormatter({
              amount: currentItem.salePrice || 0,
            })}
            style={{
              margin: "0 32px",
            }}
          />
          {currentItem.inventoryEnabled && (
            <Statistic
              title={translate("Quantity")}
              value={currentItem.quantity || 0}
              style={{
                margin: "0 32px",
              }}
            />
          )}
        </Row>
      </PageHeader>
      <Divider dashed />
      
      <Descriptions title={translate("Basic Information")}>
        <Descriptions.Item label={translate("Name")}>
          {currentItem.name}
        </Descriptions.Item>
        <Descriptions.Item label={translate("Code")}>
          {currentItem.code}
        </Descriptions.Item>
        <Descriptions.Item label={translate("Barcode")}>
          {currentItem.barcode || '-'}
        </Descriptions.Item>
        <Descriptions.Item label={translate("Category")} span={3}>
          {currentItem.category?.name || '-'}
        </Descriptions.Item>
        <Descriptions.Item label={translate("Description")} span={3}>
          {currentItem.description || '-'}
        </Descriptions.Item>
      </Descriptions>

      <Divider orientation="left">{translate("Inventory Details")}</Divider>
      <Descriptions>
        <Descriptions.Item label={translate("Unit")}>
          {translate(currentItem.unit || 'piece')}
        </Descriptions.Item>
        <Descriptions.Item label={translate("Track Inventory")}>
          {currentItem.inventoryEnabled ? translate("Yes") : translate("No")}
        </Descriptions.Item>
        {currentItem.inventoryEnabled && (
          <>
            <Descriptions.Item label={translate("Quantity")}>
              {currentItem.quantity || 0}
            </Descriptions.Item>
            <Descriptions.Item label={translate("Low Stock Threshold")}>
              {currentItem.lowStockThreshold || '-'}
            </Descriptions.Item>
          </>
        )}
      </Descriptions>

      {currentItem.supplier && (
        <>
          <Divider orientation="left">{translate("Supplier Information")}</Divider>
          <Descriptions>
            <Descriptions.Item label={translate("Name")}>
              {currentItem.supplier.name}
            </Descriptions.Item>
            <Descriptions.Item label={translate("Email")}>
              {currentItem.supplier.email || '-'}
            </Descriptions.Item>
            <Descriptions.Item label={translate("Phone")}>
              {currentItem.supplier.phone || '-'}
            </Descriptions.Item>
            <Descriptions.Item label={translate("Address")} span={3}>
              {currentItem.supplier.address || '-'}
            </Descriptions.Item>
          </Descriptions>
        </>
      )}

      {currentItem.isDigital && (
        <>
          <Divider orientation="left">{translate("Digital Product")}</Divider>
          <Descriptions>
            <Descriptions.Item label={translate("Download URL")}>
              {currentItem.downloadUrl || '-'}
            </Descriptions.Item>
          </Descriptions>
        </>
      )}

      {currentItem.images?.length > 0 && (
        <>
          <Divider orientation="left">{translate("Images")}</Divider>
          <Row gutter={[16, 16]}>
            {currentItem.images.map((image) => (
              <Col key={image.id} span={6}>
                <img 
                  src={image.path} 
                  alt={image.name} 
                  style={{ width: '100%', border: '1px solid #f0f0f0' }}
                />
              </Col>
            ))}
          </Row>
        </>
      )}
    </>
  );
}