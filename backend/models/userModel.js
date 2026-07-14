const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const pullItemSchema = require('./pullItemSchema');

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
      default: 'customer', // 'customer' or 'employee'
    },
    status: {
      type: String,
      required: true,
      default: 'active', // 'active', 'disabled'
    },
    pullList: {
      type: [pullItemSchema],
      default: [],
    },
  },
  { timestamps: true } 
);

// Encrypt password using bcrypt before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

module.exports = mongoose.model('User', userSchema);
