const mongoose = require('mongoose');
 const Userschema = mongoose.Schema({
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
          password: { 
              type: String, 
              required: true 
          },
          role: { 
              type: String, 
              enum: ['admin', 'Staff'], 
              default: 'Staff' 
          },
          createdAt: { 
              type: Date, 
              default: Date.now 
          },
          removeAt:{ 
                      type: Date, 
                      default: null 
          }
          
          

 })
module.exports = mongoose.model('User', Userschema);
