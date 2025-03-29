import React from 'react';
import { Form, Input, Switch, Select } from 'antd';
import { CloseOutlined, CheckOutlined } from '@ant-design/icons';
import useLanguage from '@/locale/useLanguage';
import SelectAsync from '@/components/SelectAsync';

const { TextArea } = Input;

export default function CategoryForm({ isUpdateForm = false }) {
  const translate = useLanguage();

  return (
    <>
      <Form.Item
        label={translate('Name')}
        name="name"
        rules={[
          {
            required: true,
            message: translate('Please input category name!'),
          },
        ]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        label={translate('Description')}
        name="description"
      >
        <TextArea rows={3} />
      </Form.Item>

      <Form.Item
        label={translate('Parent Category')}
        name="parentCategory"
      >
        <SelectAsync
          entity="category"
          displayLabels={['name']}
          outputValue="_id"
          searchFields="name"
          redirectLabel={translate('Add New Category')}
          withRedirect={true}
          urlToRedirect="/categories"
          placeholder={translate('Select parent category')}
          allowClear
        />
      </Form.Item>


      <Form.Item
        label={translate('Enabled')}
        name="enabled"
        style={{
          display: 'inline-block',
          width: 'calc(50%)',
          paddingRight: '5px',
        }}
        valuePropName="checked"
        initialValue={true}
      >
        <Switch checkedChildren={<CheckOutlined />} unCheckedChildren={<CloseOutlined />} />
      </Form.Item>

      <Form.Item
        label={translate('Default')}
        name="isDefault"
        style={{
          display: 'inline-block',
          width: 'calc(50%)',
          paddingLeft: '5px',
        }}
        valuePropName="checked"
      >
        <Switch checkedChildren={<CheckOutlined />} unCheckedChildren={<CloseOutlined />} />
      </Form.Item>
    </>
  );
}