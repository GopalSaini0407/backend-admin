const express = require('express');
const router = express.Router();
const { HotelSchema, RoomSchema } = require('../models/HotelSchema'); // Importing hotel and room models
// const upload = require('../middlewares/multer'); // Correct path for middlewares
const upload=require('../middlerwares/multer')

// Add Room API
router.post("/add-room/:hotelId", upload.array("images"), async (req, res) => {
  try {
    const hotelId = req.params.hotelId;

    // Check if the hotel exists
    const hotel = await HotelSchema.findById(hotelId);
    if (!hotel) {
      return res.status(404).json({ message: "Hotel not found" });
    }

    // Extract room details from request body
    const { roomName, price, numberOfGuests, extraBedAvailable, description, amenities, numberOfRooms } = req.body;

    // Validation: Ensure all required fields are present
    if (!roomName || !price || !numberOfGuests || !numberOfRooms || !description) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // If images are not uploaded
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "At least one image must be uploaded" });
    }

    // Process uploaded images
    const images = req.files.map((file) => file.path);

    // Create a new room
    const room = new RoomSchema({
      hotelId,
      roomName,
      numberOfRooms,
      price,
      numberOfGuests,
      extraBedAvailable,
      description,
      amenities: amenities ? amenities.split(",") : [],
      images,
    });

    // Save room to the database
    await room.save();

    // Link the room to the hotel
    hotel.rooms.push(room._id);
    await hotel.save();

    // Respond with success
    res.status(201).json({ message: "Room added successfully", room });
  } catch (error) {
    console.error("Error adding room:", error.message);
    res.status(500).json({ error: "Failed to add room", details: error.message });
  }
});


// Delete Room API
router.delete("/delete-room/:roomId", async (req, res) => {
  try {
    const roomId = req.params.roomId;

    // Find and delete the room
    const room = await RoomSchema.findByIdAndDelete(roomId);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    // Remove the room from the hotel's rooms array
    const hotel = await HotelSchema.findOne({ rooms: roomId });
    if (hotel) {
      hotel.rooms.pull(roomId); // Remove the room from the hotel's rooms array
      await hotel.save();
    }

    res.status(200).json({ message: "Room deleted successfully" });
  } catch (error) {
    console.error("Error deleting room:", error.message);
    res.status(500).json({ error: "Failed to delete room", details: error.message });
  }
});

// Get Room by ID
router.get("/get-room/:roomId", async (req, res) => {
  const { roomId } = req.params;

  try {
    const room = await RoomSchema.findById(roomId).populate("hotelId", "hotelName location");
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    // Ensure amenities is always an array
    room.amenities = room.amenities || [];

    res.status(200).json({room });
  } catch (error) {
    console.error("Error fetching room by ID:", error);
    res.status(500).json({ error: "Failed to fetch room details", details: error.message });
  }
});

// Update Room by ID
router.put("/update-room/:roomId", upload.array("images"), async (req, res) => {
  try {
    const roomId = req.params.roomId;
    const { roomName, numberOfRooms, price, numberOfGuests, extraBedAvailable, description, amenities } = req.body;
    const updateData = {};

    // Validate room existence
    const room = await RoomSchema.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    // Update fields conditionally
    if (roomName) updateData.roomName = roomName;
    if (numberOfRooms) updateData.numberOfRooms = Number(numberOfRooms); // Ensure it's a number
    if (price) updateData.price = Number(price); // Ensure it's a number
    if (numberOfGuests) updateData.numberOfGuests = Number(numberOfGuests); // Ensure it's a number
    if (extraBedAvailable !== undefined) updateData.extraBedAvailable = extraBedAvailable === "true"; // Handle checkbox value
    if (description) updateData.description = description;
    if (amenities) updateData.amenities = amenities.split(","); // Split comma-separated string into array

    // Preserve existing images and append new images if available
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map((file) => file.path);
      updateData.images = [...room.images, ...newImages]; // Combine old and new images
    }

    // Update room in the database
    const updatedRoom = await RoomSchema.findByIdAndUpdate(
      roomId,
      { $set: updateData },
      { new: true, runValidators: true } // Return the updated room and run validation
    );

    res.status(200).json({ message: "Room updated successfully", updatedRoom });
  } catch (error) {
    console.error("Error updating room:", error);
    res.status(500).json({ error: "Failed to update room", details: error.message });
  }
});

// Delete specific image by Room ID and image index
router.delete("/delete-room-image/:roomId/:imageIndex", async (req, res) => {
  const { roomId, imageIndex } = req.params;

  try {
    // Find the room by ID
    const room = await RoomSchema.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    // Ensure that the image index is valid
    if (imageIndex < 0 || imageIndex >= room.images.length) {
      return res.status(400).json({ message: "Invalid image index" });
    }

    // Remove the image at the specified index
    const deletedImage = room.images.splice(imageIndex, 1); // Remove the image from the array
    await room.save(); // Save the updated room

    // If images are stored locally, delete the file from the server
    const fs = require("fs");
    fs.unlink(deletedImage[0], (err) => {
      if (err) {
        console.error("Error deleting image from filesystem:", err);
      }
    });

    res.status(200).json({ message: "Image deleted successfully", deletedImage });
  } catch (error) {
    console.error("Error deleting room image:", error);
    res.status(500).json({ error: "Failed to delete room image", details: error.message });
  }
});


module.exports = router;
