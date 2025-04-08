const mongoose = require('mongoose');

// Room Schema for Hotel
const roomSchema = new mongoose.Schema({
  hotelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hotel',
    required: true,
  },
  roomName: {
    type: String,
    required: true,
    trim: true, // Removes leading/trailing spaces
  },
  numberOfRooms: {
    type: Number,
    required: true,
    min: 1, // Minimum number of rooms must be 1
  },
  price: {
    type: Number,
    required: true,
    min: 0, // Price must be non-negative
  },
  numberOfGuests: {
    type: Number,
    required: true,
    min: 1, // Guests must be at least 1
  },
  extraBedAvailable: {
    type: Boolean,
    default: false,
  },
  availability: {
    type: Boolean,
    default: true, // Default availability is true
  },
  description: {
    type: String,
    required: true,
    trim: true, // Removes leading/trailing spaces
  },
  images: {
    type: [String], // Array of image paths or URLs
    default: [],
  },
  amenities:
  {
    type:[String],
    default:[],

  },
  // amenities: [
  //   {
  //     type: mongoose.Schema.Types.ObjectId,
  //     ref: 'Amenity',
  //   },
  // ],
}, {
  timestamps: true, // Adds createdAt and updatedAt timestamps
});

// Amenity Schema
const amenitySchema = new mongoose.Schema({
  hotelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hotel',
    required: false,
  },
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: false, // Optional, as amenities may apply to the entire hotel
  },
  name: {
    type: String,
    required: true,
    unique: true, // Amenity name must be unique
    trim: true,
  },
  isSelected: {
    type: Boolean,
    default: false, // Default selection status is false
  },
  image: {
    type: String, // Optional image path or URL
    default: null,
  },
}, {
  timestamps: true, // Adds createdAt and updatedAt timestamps
});

// Hotel Schema
const hotelSchema = new mongoose.Schema({
  hotelName: {
    type: String,
    required: true, // Name is required
    trim: true, // Removes leading/trailing spaces
  },
  hotelType: {
    type: String,
    enum: ['individual', 'chain'], // Allowed types
    required: true,
  },
  country: {
    type: String,
    default: null, // Optional for chain-type hotels
    trim: true,
  },
  city: {
    type: String,
    default: null, // Optional for chain-type hotels
    trim: true,
  },
  address: {
    type: String,
    required: true,
    trim: true,
  },
  rating: {
    type: String,
    enum: ['3 star', '4 star', '5 star'], // Allowed ratings
    required: true,
  },
  startingPrice: {
    type: Number,
    required: true,
    min: 0, // Price must be non-negative
  },
  numberOfRooms: {
    type: Number,
    required: true,
    min: 1, // Minimum number of rooms is 1
  },
  // amenities:
  // {
  //   type:[String],
  //   default:[],

  // },
  amenities: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Amenity',
    },
  ],
  images: {
    type: [String], // Array of image paths or URLs
    default: [],
  },
  rooms: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
    },
  ],
}, {
  timestamps: true, // Adds createdAt and updatedAt timestamps
});

// Models
const AmenitySchema = mongoose.model('Amenity', amenitySchema);
const RoomSchema = mongoose.model('Room', roomSchema);
const HotelSchema = mongoose.model('Hotel', hotelSchema);

module.exports = { HotelSchema, RoomSchema, AmenitySchema };
