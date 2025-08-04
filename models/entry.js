const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { encrypt, decrypt } = require("../utils/encryption");

const entrySchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    content: {
        type: String,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    user: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
});

entrySchema.pre("save", function (next) {
  if (this.isModified("content")) {
    this.content = encrypt(this.content);
  }
  next();
});

// 🔓 Decrypt on retrieval (custom method)
entrySchema.methods.getDecryptedContent = function () {
  return decrypt(this.content);
};

const Entry = mongoose.model('Entry', entrySchema);
module.exports = Entry;