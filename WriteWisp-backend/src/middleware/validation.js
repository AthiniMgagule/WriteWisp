const validateRequired = (fields) => {
  return (req, res, next) => {
    const missingFields = fields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        error: `Missing required fields: ${missingFields.join(', ')}` 
      });
    }
    
    next();
  };
};

const validateParams = (params) => {
  return (req, res, next) => {
    const missingParams = params.filter(param => !req.params[param]);
    
    if (missingParams.length > 0) {
      return res.status(400).json({ 
        error: `Missing required parameters: ${missingParams.join(', ')}` 
      });
    }
    
    next();
  };
};

module.exports = {
  validateRequired,
  validateParams
};