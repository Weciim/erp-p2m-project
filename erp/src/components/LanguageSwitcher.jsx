    import { Select } from 'antd';
    import useLanguage from '@/locale/useLanguage';

    const { Option } = Select;

    function LanguageSwitcher() {
    const translate = useLanguage();

    const handleChange = (value) => {
        window.localStorage.setItem('locale', value); 
        window.location.reload();
    };

    return (
        <Select defaultValue={window.localStorage.getItem('locale') || 'en_us'} onChange={handleChange}>
        <Option value="en_us">English</Option>
        <Option value="fr_FR">French</Option>
        <Option value="ar_AR">Arabic</Option>
        </Select>
    );
    }

    export default LanguageSwitcher;