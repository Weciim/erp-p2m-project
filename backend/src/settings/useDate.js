const useDate = ({ settings }) => {
    const { synkro_app_date_format } = settings;
  
    const dateFormat = synkro_app_date_format;
  
    return {
      dateFormat,
    };
  };
  
  module.exports = useDate;
  