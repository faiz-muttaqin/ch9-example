const mongoose = require("mongoose");

exports.user_id = mongoose.model(
  "user_id",
  new mongoose.Schema({
    user: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    pass: {
      type: String,
      required: true,
    },
    first_name: {
      type: String,
      required: true,
    },
    last_name: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    birth: {
      type: Number,
      required: true,
    },
    gender: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    token: String,
    status: String,
  })
);

exports.user_history = mongoose.model(
  "user_history",
  new mongoose.Schema({
    user_id: {
      type: String,
      required: true,
    },
    user: {
      type: String,
      required: true,
    },
    win: {
      type: Number,
      required: true,
    },
    draw: {
      type: Number,
      required: true,
    },
    lose: {
      type: Number,
      required: true,
    },
    scheme: {
      type: String,
      required: true,
    },
    oponent: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Number,
      required: true,
    },
  })
);
