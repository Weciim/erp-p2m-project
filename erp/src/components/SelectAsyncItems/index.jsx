import { useState, useEffect, useRef } from 'react';
import { request } from '@/request';
import useFetch from '@/hooks/useFetch';
import { Select, Tag, Input } from 'antd';
import { useNavigate } from 'react-router-dom';
import { generate as uniqueId } from 'shortid';
import color from '@/utils/color';
import useLanguage from '@/locale/useLanguage';

const { Search } = Input;

const SelectAsyncItems = ({
  entity = 'items',
  displayLabels = ['name', 'code'],
  outputValue = '_id',
  redirectLabel = '',
  withRedirect = false,
  urlToRedirect = '/items',
  placeholder = 'Select item',
  value,
  onChange,
}) => {
  const translate = useLanguage();
  const [selectOptions, setOptions] = useState([]);
  const [filteredOptions, setFilteredOptions] = useState([]);
  const [currentValue, setCurrentValue] = useState(undefined);
  const [searchValue, setSearchValue] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef(null);

  const navigate = useNavigate();

  const asyncList = (search = '') => {
    const params = search ? { search, searchFields: 'code,name' } : {};
    return request.list({ entity, params });
  };

  const { result, isLoading: fetchIsLoading, isSuccess } = useFetch(asyncList);

  useEffect(() => {
    if (isSuccess) {
      setOptions(result);
      setFilteredOptions(result);
    }
  }, [isSuccess, result]);

  const labels = (optionField) => {
    return displayLabels.map((x) => optionField[x]).join(' - ');
  };

  useEffect(() => {
    if (value !== undefined) {
      const val = value?.[outputValue] ?? value;
      setCurrentValue(val);
    }
  }, [value]);

  const handleSelectChange = (newValue) => {
    if (newValue === 'redirectURL') {
      navigate(urlToRedirect);
    } else {
      const val = newValue?.[outputValue] ?? newValue;
      setCurrentValue(val);
      onChange(val);
    }
  };

  const handleSearch = (value) => {
    setSearchValue(value);
    setIsSearching(true);
    
    if (value) {
      const filtered = selectOptions.filter(item => 
        item.code.toLowerCase().includes(value.toLowerCase()) || 
        item.name.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredOptions(filtered);
    } else {
      setFilteredOptions(selectOptions);
    }
    
    setIsSearching(false);
  };

  const optionsList = () => {
    const list = [];

    filteredOptions.forEach((optionField) => {
      const value = optionField[outputValue] ?? optionField;
      const label = labels(optionField);
      list.push({ 
        value, 
        label,
        code: optionField.code,
        originalItem: optionField
      });
    });

    return list;
  };

  return (
    <div>
      <div style={{ marginBottom: 8 }}>
        <Search
          ref={searchRef}
          placeholder="Search by code or name"
          allowClear
          enterButton
          size="small"
          onSearch={handleSearch}
          onChange={(e) => handleSearch(e.target.value)}
          loading={isSearching}
        />
      </div>
      <Select
        showSearch
        loading={fetchIsLoading}
        disabled={fetchIsLoading}
        value={currentValue}
        onChange={handleSelectChange}
        placeholder={placeholder}
        optionFilterProp="children"
        filterOption={(input, option) =>
          option?.code?.toLowerCase().indexOf(input.toLowerCase()) >= 0 ||
          option?.label?.toLowerCase().indexOf(input.toLowerCase()) >= 0
        }
        style={{ width: '100%' }}
      >
        {optionsList().map((option) => (
          <Select.Option 
            key={`${uniqueId()}`} 
            value={option.value}
            code={option.code}
            label={option.label}
            item={option.originalItem}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>{option.code}</span>
              <span>{option.label.replace(option.code, '').replace(' - ', '')}</span>
            </div>
          </Select.Option>
        ))}
        {withRedirect && (
          <Select.Option value="redirectURL">
            {`+ ${translate(redirectLabel)}`}
          </Select.Option>
        )}
      </Select>
    </div>
  );
};

export default SelectAsyncItems;