const mongoose = require('mongoose');
const SaleSchema = mongoose.Schema({
          //like stock and raw material 
          saleType :{ 
                    type: String,
                    required: true,
                    enum: ['stock', 'rawMaterial']
          },
          salematerialId:{ 
                    type: mongoose.Schema.Types.ObjectId,
                    refPath: 'saleType',
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
          
          totalamnount: {
                    type: Number,
                    required: true
          },
          quantity: {
                    type: Number,
                    required: true
          },
          saleDate: {
                    type: Date,
                    default: Date.now
          },
          payment:{ 


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
module.exports = mongoose.model('Sale', SaleSchema);