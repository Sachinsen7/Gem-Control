const mongoose = require('mongoose');
const UdharSchema = mongoose.Schema({
          customer: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Customer',
          required: true
          },
          firm:{ 
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Firm',
          required: true
          },
          amount: {
          type: Number,
          required: true
          },
          udharDate: {
          type: Date,
          default: Date.now
          },
          sale:{ 
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Sale',
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
module.exports = mongoose.model('Udhar', UdharSchema);
