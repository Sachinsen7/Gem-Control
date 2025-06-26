const mongoose = require('mongoose');
const paymentSchema = mongoose.Schema({
          paymentType: {
          type: String,
          required: true,
          enum: ['cash', 'credit', 'debit', 'online', 'bankTransfer', 'udharsetelment' , 'Upi', 'other']
          },
          paymentRefrence:{ 
          type: String,
          required: true,
          },
          amount: {
          type: Number,
          required: true
          },
          paymentDate: {
          type: Date,
          default: Date.now
          },
          sale: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Sale',
          required: true
          },
          customer: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Customer',
          required: true
          },
          firm: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Firm',
          required: true
          },
          
          createdAt: {
          type: Date,
          default: Date.now
          },
          removeAt: {
          type: Date,
          default: null
          }
          });
module.exports = mongoose.model('Payment', paymentSchema);