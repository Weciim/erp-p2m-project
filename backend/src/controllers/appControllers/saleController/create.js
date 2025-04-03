const mongoose = require('mongoose');
const SaleModel = mongoose.model('Sale');
const InvoiceModel = mongoose.model('Invoice');
const PaymentModel = mongoose.model('Payment');
const { calculate } = require('@/helpers');
const { increaseBySettingKey } = require('@/middlewares/settings');
const schema = require('./schemaValidate');

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

    // Calculate sale totals
    const updatedItems = items.map((item) => {
      const itemTotal = calculate.multiply(item.quantity, item.price);
      subTotal = calculate.add(subTotal, itemTotal);
      return {
        ...item,
        total: itemTotal,
      };
    });
    taxTotal = calculate.multiply(subTotal, taxRate / 100);
    total = calculate.add(subTotal, taxTotal);

    let paymentStatus = calculate.sub(total, discount) === 0 ? 'paid' : 'unpaid';

    // Create sale data
    const saleData = {
      ...value,
      items: updatedItems,
      paymentStatus,
      createdBy: req.admin._id,
      subTotal,
      taxTotal,
      total,
    };

    // Create sale
    const sale = await new SaleModel(saleData).save();
    // Create invoice
    const invoiceData = {
      client: sale.client,
      number: await getNextNumber('last_invoice_number'),
      year: new Date().getFullYear(),
      date: sale.date,
      expiredDate: new Date(new Date(sale.date).setDate(new Date(sale.date).getDate() + 30)), // 30 days from sale date
      items: sale.items.map((item) => ({
        itemName: item.itemName,
        description: item.description,
        quantity: item.quantity,
        price: item.price,
        total: item.total,
      })),
      taxRate: sale.taxRate,
      subTotal: sale.subTotal,
      taxTotal: sale.taxTotal,
      total: sale.total,
      discount: sale.discount,
      paymentStatus: sale.paymentStatus,
      currency: sale.currency,
      status: 'sent',
      createdBy: req.admin._id,
    };

    const invoice = await new InvoiceModel(invoiceData).save();
    const invoiceFileId = 'invoice-' + invoice._id + '.pdf';
    await InvoiceModel.findByIdAndUpdate(invoice._id, { pdf: invoiceFileId });

    // Create payment if sale is paid
    let payment = null;
    if (paymentStatus === 'paid') {
      const paymentData = {
        client: sale.client,
        invoice: invoice._id,
        number: await getNextNumber('last_payment_number'),
        date: sale.date,
        amount: total,
        currency: sale.currency,
        paymentMode: body.paymentMode,
        ref: body.paymentRef,
        description: `Payment for sale ${sale.number}`,
        createdBy: req.admin._id,
      };

      payment = await PaymentModel.create(paymentData);
      const paymentFileId = 'payment-' + payment._id + '.pdf';
      await PaymentModel.findByIdAndUpdate(payment._id, { pdf: paymentFileId });

      // Update invoice with payment
      await InvoiceModel.findOneAndUpdate(
        { _id: invoice._id },
        {
          $push: { payment: payment._id },
          $inc: { credit: total },
          $set: { paymentStatus: 'paid' },
        }
      );
    }

    // Update sale numbers
    await increaseBySettingKey({ settingKey: 'last_sale_number' });

    // Return response with all created documents
    const result = {
      sale,
      invoice,
      payment,
    };

    return res.status(200).json({
      success: true,
      result,
      message: 'Sale, invoice and payment created successfully',
    });
  } catch (error) {
    console.error('Error creating sale:', error);
    return res.status(500).json({
      success: false,
      result: null,
      message: error.message || 'Internal server error',
    });
  }
};

// Helper function to get next sequential number
async function getNextNumber(settingKey) {
  const { [settingKey]: lastNumber = 0 } = await increaseBySettingKey({ settingKey });
  return lastNumber + 1;
}

module.exports = create;
