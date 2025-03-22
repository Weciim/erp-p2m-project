const createCRUDController = require('@/controllers/middlewaresControllers/createCRUDController');
const methods = createCRUDController('Purchase');

const create = require('./create');
const read = require('./read');

methods.create = create;
methods.read = read;

module.exports = methods;
