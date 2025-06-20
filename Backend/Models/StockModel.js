const mongoose = require('mongoose');
const StockSchema = mongoose.Schema({
          name: {
                    type: String,
                    required: true
          },
          materialgitType: {
                    type: String,
                    required: true,
                    enum: ['gold', 'silver', 'platinum', 'diamond', 'other']

          },
          stockImg: { 
                    type: String,
                    required: true
          },
          stockcode: {
                    type: String,
                    required: true,
                    unique: true
          },
          waight: {
                    type: Number,
                    required: true
          },
          category: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'StockCategory',
                    required: true
          },
          firm: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Firm',
                    required: true
          },

          quantity: {
                    type: Number,
                    required: true
          },
          price: {
                    type: Number,
                    required: true
          },
          makingCharge: {
                    type: Number,
                    required: true
          },
          totalValue: {
                    type: Number,
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
module.exports = mongoose.model('Stock', StockSchema);
