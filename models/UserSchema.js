const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,  // Name is required
    trim: true,      // Removes any leading/trailing spaces
  },
  email: {
    type: String,
    required: true,  // Email is required
    unique: true,    // Ensure email is unique
    lowercase: true, // Automatically convert email to lowercase
    match: [/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/, 'Please fill a valid email address'],
  },
  password: {
    type: String,
    required: true,  // Password is required
    minlength: 6,    // Minimum password length
  },
  mobile: {
    type: String,
    required: true,  // Mobile is required
    match: [/^\d{10}$/, 'Please fill a valid mobile number'], // Only allows 10-digit numbers
  },
  userType: {
    type: String,
    enum: ['admin', 'editor', 'sale'], // Valid options
    required: true,
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'block'], // Valid options
    required: true,
  },
  profileImg: {
    type: String,  // This can store the URL of the image or the file name
    default: '',   // Default to empty string if no image is provided
  },
  salt: {
    type: String, // Store the salt value
  },
  resetPasswordToken: String,   // Reset token
  resetPasswordExpires: Date,   // Token expiration time
}, {
  timestamps: true, // Automatically add createdAt and updatedAt timestamps
});

// Hashing the password and salt before saving it to database
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }

  // Generate salt (10 rounds)
  const salt = await bcrypt.genSalt(10);
  
  // Hash the password using the generated salt
  this.password = await bcrypt.hash(this.password, salt);
  
  // Store the salt in the database
  this.salt = salt; // Store salt in the 'salt' field
  
  next();
});

// Method to compare entered password with hashed password in DB
userSchema.methods.comparePassword = async function(enteredPassword) {
  // Compare the entered password with the stored hashed password
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('users', userSchema);
