const mongoose = require("mongoose");
const girviSchema = mongoose.Schema({
  itemName: {
    type: String,
    required: true,
  },
  itemType: {
    //like gold sliver daimond etc
    type: String,
    required: true,
  },
  itemWeight: {
    type: Number,
    required: true,
  },
  itemValue: {
    type: Number,
    required: true,
  },
  totalpayAmount:{ 
          type: Number,
          required: true,
  },
  itemImage: {
    type: String,
    required: true,
  },
  itemDescription: {
    type: String,
    required: true,
  },
  interestRate: {
    type: Number,
    required: true,
  },
  Customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
    required: true,
  },
  firm:{ 
          type: mongoose.Schema.Types.ObjectId,
          ref: "Firm",
          required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastDateToTake: {
    type: Date,
    required: true,
  },
  removeAt: {
    type: Date,
    default: null,
  },
});

module.exports = mongoose.model("Girvi", girviSchema);
