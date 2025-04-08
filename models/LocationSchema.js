const mongoose = require("mongoose");

// Continent Schema
const continentSchema = new mongoose.Schema({
  name: {
    type: String,
    unique: true,
    required: true,
    trim: true, // Removes extra spaces
  },
  shortName: {
    type: String,
    unique: true,
    required: true,
    trim: true,
    uppercase: true, // Converts to uppercase automatically
    minlength: 2,
    maxlength: 3, // Validates shortName length
  },
  status: {
    type: String,
    enum: ["active", "inactive"], // Only allow "active" or "inactive"
    default: "active",           // Default value is "active"
  },
});

// Index for database-level constraints
// continentSchema.index({ name: 1 }, { unique: true });
// continentSchema.index({ shortName: 1 }, { unique: true });

// Country Schema
const countrySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  shortName: {
    type: String,
    unique: true,
    required: true,
    trim: true,
    uppercase: true,
    minlength: 2,
    maxlength: 3, // Validates shortName length
  },
  status: {
    type: String,
    enum: ["active", "inactive"], // Only allow "active" or "inactive"
    default: "active",           // Default value is "active"
  },
  flagImg: {
    type:String, 
    default: null,
  },
  
  continentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Continent",
    required: true,
  },
});

// Index for database-level constraints
// countrySchema.index({ name: 1 }, { unique: true });
// countrySchema.index({ shortName: 1 }, { unique: true });

// State Schema
const stateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  shortName: {
    type: String,
    required: true,
    trim: true,
    uppercase: true,
    minlength: 2,
    maxlength: 3,
  },
  status: {
    type: String,
    enum: ["active", "inactive"], // Only allow "active" or "inactive"
    default: "active",           // Default value is "active"
  },
  countryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Country",
    required: true,
  },
});

// State name should be unique within a country
// stateSchema.index({ name: 1, countryId: 1 }, { unique: true });

// // City Schema
const citySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  shortName: {
    type: String,
    required: true,
    trim: true,
    uppercase: true,
    minlength: 2,
    maxlength: 3,
  },
  status: {
    type: String,
    enum: ["active", "inactive"], // Only allow "active" or "inactive"
    default: "active",           // Default value is "active"
  },
  stateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "State",
    required: true,
  },
});

// City name should be unique within a state
// citySchema.index({ name: 1, stateId: 1 }, { unique: true });

// Models
const ContinentSchema = mongoose.model("Continent", continentSchema);
const CountrySchema = mongoose.model("Country", countrySchema);
const StateSchema = mongoose.model("State", stateSchema);
const CitySchema = mongoose.model("City", citySchema);

module.exports = { ContinentSchema, CountrySchema, StateSchema, CitySchema };
