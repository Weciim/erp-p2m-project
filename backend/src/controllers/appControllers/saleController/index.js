const createCRUDController = require('@/controllers/middlewaresControllers/createCRUDController');
const methods = createCRUDController('Sale');

const create = require('./create');
const read = require('./read');
const update = require('./update');
const remove = require('./remove');

methods.create = create;
methods.read = read;
methods.remove = remove;
methods.update = update;

module.exports = methods;
