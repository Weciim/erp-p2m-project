const mongoose = require('mongoose');
const PurchaseModel = mongoose.model('Purchase');
const ItemsModel = mongoose.model('Items');
const SettingsModel = require('@/models/coreModels/Setting');
const { calculate } = require('@/helpers');
const schema = require('./schemaValidate');
const itemSchema = require('@/controllers/appControllers/itemsController/schemaValidate');

const create = async (req, res) => {
  try {
    let body = req.body;

    // Validate request body
    const { error, value } = schema.validate(body);
    if (error) {
      return res.status(400).json({
        success: false,
        result: null,
        message: error.details[0].message,
      });
    }

    const { items = [], taxRate = 0, discount = 0 } = value;
    let subTotal = 0;
    let taxTotal = 0;
    let total = 0;

    // First, count how many new items we need to create
    const newItemsCount = items.filter(item => !item.item && item.itemName).length;

    // Atomically get and increment the last_item_number
    const { last_item_number = 0 } = await SettingsModel.findOneAndUpdate(
      { key: 'last_item_number' },
      { $inc: { value: newItemsCount } },
      { new: true, upsert: true }
    );

    const updatedItems = await Promise.all(items.map(async (item, index) => {
      const itemTotal = calculate.multiply(item.quantity, item.price);
      subTotal = calculate.add(subTotal, itemTotal);

      // For new items (when itemName is provided but no item ID)
      if (!item.item && item.itemName) {
        const itemNumber = last_item_number - newItemsCount + index + 1;
        const itemData = {
          name: item.itemName,
          description: item.description || '',
          type: 'product', 
          unit: 'piece', 
          costPrice: item?.price,
          salePrice: item?.item?.salePrice || calculate.multiply(item.price, 1.2),
          quantity: item.quantity,
          inventoryEnabled: item.item?.inventoryEnabled !== undefined ? 
            item.item.inventoryEnabled : true,
          supplier: value.supplier,
          createdBy: req.admin._id,
          code: `ITM-${itemNumber.toString().padStart(4, '0')}`
        };

        // Validate item data
        const { error: itemError } = itemSchema.validate(itemData);
        if (itemError) {
          throw new Error(`Invalid item data: ${itemError.details[0].message}`);
        }

        // Create new item with fallback for duplicate codes
        try {
          const newItem = await ItemsModel.create(itemData);
          return {
            item: newItem._id,
            itemName: newItem.name,
            quantity: item.quantity,
            price: item.price,
            taxRate: item.taxRate || null,
            discount: item.discount || 0,
            total: itemTotal,
            description: item.description || '',
            receivedQuantity: 0,
            status: 'ordered'
          };
        } catch (err) {
          if (err.code === 11000) { // Duplicate key error
            // Fallback to timestamp-based code
            itemData.code = `ITM-${Date.now().toString(36).toUpperCase()}`;
            const newItem = await ItemsModel.create(itemData);
            return {
              item: newItem._id,
              itemName: newItem.name,
              quantity: item.quantity,
              price: item.price,
              taxRate: item.taxRate || null,
              discount: item.discount || 0,
              total: itemTotal,
              description: item.description || '',
              receivedQuantity: 0,
              status: 'ordered'
            };
          }
          throw err;
        }
      }

      // For existing items (when item ID is provided)
      const existingItem = await ItemsModel.findById(item.item);
      if (!existingItem) {
        throw new Error(`Item with ID ${item.item} not found`);
      }

      return {
        item: item.item,
        itemName: item.itemName || existingItem.name,
        quantity: item.quantity,
        price: item.price,
        taxRate: item.taxRate || existingItem.taxRate || null,
        discount: item.discount || 0,
        total: itemTotal,
        description: item.description || existingItem.description || '',
        receivedQuantity: 0,
        status: 'ordered'
      };
    }));

    // Calculate totals
    taxTotal = calculate.multiply(subTotal, taxRate / 100);
    total = calculate.add(calculate.sub(subTotal, discount), taxTotal);

    // Determine payment status
    let paymentStatus = 'unpaid';
    if (value.paymentStatus && ['unpaid', 'paid', 'partially'].includes(value.paymentStatus)) {
      paymentStatus = value.paymentStatus;
    } else if (calculate.sub(total, discount) === 0) {
      paymentStatus = 'paid';
    }

    // Create purchase data
    const purchaseData = {
      ...value,
      items: updatedItems,
      paymentStatus,
      createdBy: req.admin._id,
      subTotal,
      taxTotal,
      total,
      status: value.status || 'draft',
      date: value.date || new Date(),
    };

    // Create purchase
    const result = await new PurchaseModel(purchaseData).save();

    // Return populated purchase
    const populatedPurchase = await PurchaseModel.findById(result._id)
      .populate('supplier')
      .populate('items.item')
      .exec();

    return res.status(200).json({
      success: true,
      result: populatedPurchase,
      message: 'Purchase created successfully',
    });

  } catch (error) {
    console.error('Error creating purchase:', error);
    return res.status(500).json({
      success: false,
      result: null,
      message: error.message || 'Internal server error',
    });
  }
};

module.exports = create;