const mongoose = require('mongoose');
const CoustomersSchema = mongoose.Schema({
          name: {
          type: String,
          required: true
          },
          email: {
          type: String,
          required: true,
          unique: true
          },
          contact: {
          type: String,
          required: true,
          unique: true
          },
          firm:{ 
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Firm',
          required: true
          },
          
          address: {
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
          module.exports = mongoose.model('Customer', CoustomersSchema);
