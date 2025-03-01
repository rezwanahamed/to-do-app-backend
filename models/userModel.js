const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  twoFactorSecret: {
    type: String,
  },
  isTwoFactorEnabled: {
    type: Boolean,
    default: false,
  },
  googleId: {
    type: String,
  },
  googleAuth: {
    connected: {
      type: Boolean,
      default: false,
    },
    lastSyncTime: Date,
  },
  otp: {
    code: String,
    expiresAt: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to check password validity
userSchema.methods.isValidPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// Method to check if Google Calendar is connected
userSchema.methods.isGoogleCalendarConnected = function () {
  return (
    this.googleAuth &&
    this.googleAuth.connected &&
    this.googleAuth.access_token &&
    this.googleAuth.refresh_token
  );
};

// Method to disconnect Google Calendar
userSchema.methods.disconnectGoogleCalendar = function () {
  this.googleAuth = {
    connected: false,
  };
  return this.save();
};

const User = mongoose.model("User", userSchema);

module.exports = User;
