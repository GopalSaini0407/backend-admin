const jwt = require("jsonwebtoken");

// Function to generate JWT token
const generateToken = (user) => {
  try {
    // Ensure user is a plain object before passing to jwt.sign()
    if (typeof user !== 'object' || user === null) {
      throw new Error("User should be a plain object.");
    }

    // Generate token with user info and secret from environment
    const token = jwt.sign(user, process.env.SECRET_TOKEN, { expiresIn: "1h" });
    return token;
  } catch (error) {
    console.error("Error generating token:", error.message);
    throw error;
  }
};

module.exports = generateToken;
