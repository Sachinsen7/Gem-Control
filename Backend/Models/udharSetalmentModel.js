const mongoose = require('mongoose');
const UdharsetalmentSchema = mongoose.Schema({
          udhar: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Udhar',
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
          sale:{
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Sale',
          required: true
          },
          amount: {
          type: Number,
          required: true
          },
          paymentDate: {
          type: Date,
          default: Date.now
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
module.exports = mongoose.model('Udharsetalment', UdharsetalmentSchema);