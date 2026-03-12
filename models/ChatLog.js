const mongoose = require('mongoose');

const chatLogSchema = new mongoose.Schema(
  {
    message: {
      type: String,
      required: true,
      trim: true
    },
    reply: {
      type: String,
      required: true,
      trim: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.models.ChatLog || mongoose.model('ChatLog', chatLogSchema);
