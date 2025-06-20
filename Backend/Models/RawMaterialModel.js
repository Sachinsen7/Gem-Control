const mongoose = require('mongoose');
const RawMaterialSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    materialType: {
        type: String,
        required: true,
        enum: ['gold', 'silver', 'platinum', 'diamond', 'other']
    },
    RawMaterialcode: {
        type: String,
        required: true,
        unique: true
    },
    weight: {
        type: Number
        
    },
    rawmaterialImg:{
        type: String,
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
module.exports = mongoose.model('RawMaterial', RawMaterialSchema);