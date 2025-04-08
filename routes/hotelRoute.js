// routes/hotel.js
const express = require('express');
const router = express.Router();
const {HotelSchema ,RoomSchema} = require('../models/HotelSchema') // Importing hotel model
const upload=require('../middlerwares/multer') // Multer for image upload

// Create a new hotel
router.post('/add-hotel', upload.array('images'), async (req, res) => {
  try {
    console.log('Request Body:', req.body); // Logs non-file fields
    console.log('Uploaded Files:', req.files); // Logs uploaded images
    const amenities = JSON.parse(req.body.amenities);

    // Destructure the fields from the request body
    const { hotelName, hotelType, country, city, address, rating, startingPrice, numberOfRooms} = req.body;

    // Validate required fields
    if (!hotelName || !hotelType || !address || !startingPrice || !numberOfRooms || !rating) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (hotelType === 'individual') {
      if (!country || !city) {
        return res.status(400).json({ error: 'Country and City are required for individual hotel type' });
      }
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No images uploaded' });
    }

    const images = req.files.map(file => file.path);

    // Create hotel object
    const hotel = new HotelSchema({
      hotelName,
      hotelType,
      country: hotelType === 'individual' ? country : null,
      city: hotelType === 'individual' ? city : null,
      address,
      rating,
      startingPrice: Number(startingPrice),
      numberOfRooms: Number(numberOfRooms),
      amenities: amenities ? amenities:[],
      images,
    });

    // Save the hotel
    await hotel.save();

    res.status(201).json({ message: 'Hotel created successfully', hotel });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all hotels
router.get('/get-hotels', async (req, res) => {
  try {
    const hotels = await HotelSchema.find();  // Fetch all hotels

    if (!hotels.length) {
      return res.status(404).json({ message: 'No hotels found' });
    }

    res.status(200).json(hotels);  // Return the list of hotels
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});
// Get hotel details by ID, including rooms
router.get('/get-hotel/:id', async (req, res) => {
  try {
    const hotelId = req.params.id;

    // Fetch hotel by ID and populate rooms (to get the room details)
    const hotel = await HotelSchema.findById(hotelId).populate('rooms').populate('amenities');

    if (!hotel) {
      return res.status(404).json({ message: 'Hotel not found' });
    }

    res.status(200).json(hotel);  // Return hotel details including rooms
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete hotel by ID
router.delete('/delete-hotel/:id', async (req, res) => {
  try {
    const hotelId = req.params.id;

    // Find the hotel by ID
    const hotel = await HotelSchema.findById(hotelId);

    if (!hotel) {
      return res.status(404).json({ message: 'Hotel not found' });
    }

    // Remove associated rooms if they exist
    await RoomSchema.deleteMany({ hotelId });

    // Delete the hotel
    await HotelSchema.findByIdAndDelete(hotelId);

    res.status(200).json({ message: 'Hotel and associated rooms deleted successfully' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to delete hotel' });
  }
});

// Update hotel by ID
router.put('/update-hotel/:id', upload.array('images'), async (req, res) => {
  try {
    const hotelId = req.params.id; // Extract hotel ID from the URL params
    const amenities = JSON.parse(req.body.amenities);
    const { hotelName, hotelType, country, city, address, rating, startingPrice, numberOfRooms} = req.body;
    const updateData = {};

    // Validate hotel existence
    const hotel = await HotelSchema.findById(hotelId);
    if (!hotel) {
      return res.status(404).json({ message: 'Hotel not found' });
    }

    // Update fields conditionally based on what is provided
    if (hotelName) updateData.hotelName = hotelName;
    if (hotelType) updateData.hotelType = hotelType;
    if (hotelType === 'individual') {
      if (!country || !city) {
        return res.status(400).json({ error: 'Country and City are required for individual hotel type' });
      }
      updateData.country = country;
      updateData.city = city;
    }
    if (address) updateData.address = address;
    if (rating) updateData.rating = rating;
    if (startingPrice) updateData.startingPrice = Number(startingPrice);
    if (numberOfRooms) updateData.numberOfRooms = Number(numberOfRooms);
    if (amenities) updateData.amenities =amenities;

    // Preserve existing images and append new images
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map((file) => file.path);
      updateData.images = [...hotel.images, ...newImages]; // Append new images to old images
    }

    // Update the hotel in the database
    const updatedHotel = await HotelSchema.findByIdAndUpdate(
      hotelId,
      { $set: updateData }, // Set the updated fields
      { new: true, runValidators: true } // Return the updated document and validate the updates
    );

    res.status(200).json({ message: 'Hotel updated successfully', updatedHotel });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to update hotel', details: error.message });
  }
});

// Delete specific image by ID
router.delete('/delete-image/:hotelId/:imageIndex', async (req, res) => {
  const { hotelId, imageIndex } = req.params;

  try {
    // Find the hotel by ID
    const hotel = await HotelSchema.findById(hotelId);
    if (!hotel) {
      return res.status(404).json({ message: 'Hotel not found' });
    }

    // Ensure that the image index is valid
    if (imageIndex < 0 || imageIndex >= hotel.images.length) {
      return res.status(400).json({ message: 'Invalid image index' });
    }

    // Remove the image at the specified index
    const deletedImage = hotel.images.splice(imageIndex, 1); // Remove the image from the array
    await hotel.save(); // Save the updated hotel

    // If you are storing images locally, you can delete the file from the server too:
    const fs = require('fs');
    fs.unlink(deletedImage[0], (err) => {
      if (err) {
        console.error('Error deleting image from filesystem:', err);
      }
    });

    res.status(200).json({ message: 'Image deleted successfully', deletedImage });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to delete image', details: error.message });
  } 
});

module.exports = router;
