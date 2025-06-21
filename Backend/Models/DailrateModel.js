const mongoose = require("mongoose");

const materialSchema = new mongoose.Schema(
  {
    gold: {
      "24K": {
        type: Number,
        required: true,
      },
      "23K": {
        type: Number,
        required: true,
      },

      "22K": {
        type: Number,
        required: true,
      },
      "20K": {
        type: Number,
        required: true,
      },
      "18K": {
        type: Number,
        required: true,
      },
    },
    silver: {
      type: Number,
      required: true,
    },
    daimond: {
      "0_5 Carat": {
        type: Number,
        required: true,
      },
      "1 Carat": {
        type: Number,
        required: true,
      },
      "1_5 Carat": {
        type: Number,
        required: true,
      },
      "2 Carat": {
        type: Number,
        required: true,
      },
      "2_5 Carat": {
        type: Number,
        required: true,
      },
      "3 Carat": {
        type: Number,
        required: true,
      },
    },
  },

  { _id: false },
  { timestamps: true }
);
const dailrateSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
    },
    rate: {
      type: materialSchema,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Dailrate", dailrateSchema);