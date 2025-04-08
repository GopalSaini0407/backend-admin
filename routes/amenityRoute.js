const express = require('express');
const mongoose = require('mongoose');
const {HotelSchema ,RoomSchema,AmenitySchema} = require('../models/HotelSchema');
const upload=require('../middlerwares/multer');
const router = express.Router();

// Create a new amenity
// Route to handle adding amenities
// Create a new amenity
router.post('/add-amenity', upload.single('image'), async (req, res) => {
  try {
    const { name, isSelected } = req.body;

    // Validate required fields
    if (!name) {
      return res.status(400).json({ error: 'Amenity name is required.' });
    }

    // If the image is uploaded, get the image path
    const imagePath = req.file ? `/uploads/amenities/${req.file.filename}` : null;

    // Create new amenity
    const amenity = new AmenitySchema({
      name,
      isSelected: isSelected || false,
      image: imagePath, // Save the image path
    });

    // Save to database
    await amenity.save();
    res.status(201).json({ message: 'Amenity created successfully.', amenity });
  } catch (error) {
    console.error('Error adding amenity:', error);
    res.status(500).json({ error: error.message });
  }
});

// get by id
router.get('/get-amenity/:id', async (req, res) => {
  try {
    const amenityId = req.params.id;

    const amenity = await AmenitySchema.findById(amenityId);
    if (!amenity) {
      return res.status(404).json({ message: 'Amenity not found.' });
    }

    res.status(200).json({ message: 'Amenity fetched successfully.', amenity });
  } catch (error) {
    console.error('Error fetching amenity:', error);
    res.status(500).json({ error: error.message });
  }
});
// get all
router.get('/get-amenities', async (req, res) => {
  try {
    const amenities = await AmenitySchema.find(); // Fetch all amenities
    res.status(200).json({ message: 'Amenities fetched successfully.', amenities });
  } catch (error) {
    console.error('Error fetching amenities:', error);
    res.status(500).json({ error: error.message });
  }
});

// update
router.put('/update-amenity/:id', upload.single('image'), async (req, res) => {
  try {
    const amenityId = req.params.id;
    const { name, isSelected } = req.body;
    const image = req.file ? req.file.path : null;

    // Update amenity fields
    const updatedAmenity = await AmenitySchema.findByIdAndUpdate(
      amenityId,
      { name, isSelected, image },
      { new: true, runValidators: true }
    );

    if (!updatedAmenity) {
      return res.status(404).json({ message: 'Amenity not found.' });
    }

    res.status(200).json({ message: 'Amenity updated successfully.', updatedAmenity });
  } catch (error) {
    console.error('Error updating amenity:', error);
    res.status(500).json({ error: error.message });
  }
});

// delete
router.delete('/delete-amenity/:id', async (req, res) => {
  try {
    const amenityId = req.params.id;

    const deletedAmenity = await AmenitySchema.findByIdAndDelete(amenityId);
    if (!deletedAmenity) {
      return res.status(404).json({ message: 'Amenity not found.' });
    }

    res.status(200).json({ message: 'Amenity deleted successfully.', deletedAmenity });
  } catch (error) {
    console.error('Error deleting amenity:', error);
    res.status(500).json({ error: error.message });
  }
});

// Search for amenities by name
router.get('/search-amenities', async (req, res) => {
  const { query } = req.query;  // The search term from the query string
  try {
    // Search amenities by name
    const amenities = await AmenitySchema.find({
      name: { $regex: query, $options: 'i' }, // Case-insensitive search
    });
    res.status(200).json({
      message: 'Amenities fetched successfully.',
      amenities,
    });
  } catch (err) {
    console.error('Error fetching amenities:', err);
    res.status(500).json({
      error: 'An error occurred while fetching amenities.',
    });
  }
});


module.exports = router;
