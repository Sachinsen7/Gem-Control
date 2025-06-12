const mongoose = require('mongoose');
const StockCategorySchema = mongoose.Schema({
          name: {
          type: String,
          required: true,
          unique: true
          },
          description: {
          type: String,
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
module.exports = mongoose.model('StockCategory', StockCategorySchema);
