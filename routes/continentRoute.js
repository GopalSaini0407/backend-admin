const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

// Import the model instead of schema
const { ContinentSchema } = require('../models/LocationSchema'); // assuming ContinentSchema is the model name in LocationSchema file

// POST route to add a continent
router.post('/add-continent', async (req, res) => {
    try {
        const { name, shortName,status} = req.body;
        
        if (!name || !shortName ||!status) {
            return res.status(400).json({ message: "Please provide both name and shortName" });
        }
        
        // Create a new continent instance from the model
        const continent = new ContinentSchema({
            name,
            shortName,
            status,
        });
        
        // Save the continent to the database
        await continent.save();
        
        // Send a success response
        res.status(200).json({ message: "Continent added successfully", continent });

    } catch (error) {
        // Handle any errors
        res.status(500).json({ message: error.message });
    }
});


// GET route to fetch all continents
router.get('/get-continents', async (req, res) => {
    try {
        const continents = await ContinentSchema.find();
        res.status(200).json(continents);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET route to fetch a continent by ID
router.get('/get-continent/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const continent = await ContinentSchema.findById(id);

        if (!continent) {
            return res.status(404).json({ message: "Continent not found" });
        }

        res.status(200).json(continent);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// PUT route to update a continent by ID
router.put('/update-continent/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, shortName, status } = req.body;

        // Check if required fields are provided
        if (!name && !shortName && !status) {
            return res.status(400).json({ message: "Please provide at least one field to update (name, shortName, or status)" });
        }

        // Update the continent
        const updatedContinent = await ContinentSchema.findByIdAndUpdate(
            id,
            { 
                ...(name && { name }),         // Update name if provided
                ...(shortName && { shortName }), // Update shortName if provided
                ...(status && { status }),     // Update status if provided
            },
            { new: true, runValidators: true } // Return the updated document and validate inputs
        );

        // If the continent is not found
        if (!updatedContinent) {
            return res.status(404).json({ message: "Continent not found" });
        }

        res.status(200).json({ message: "Continent updated successfully", updatedContinent });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// DELETE route to remove a continent by ID
router.delete('/delete-continent/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const deletedContinent = await ContinentSchema.findByIdAndDelete(id);

        if (!deletedContinent) {
            return res.status(404).json({ message: "Continent not found" });
        }

        res.status(200).json({ message: "Continent deleted successfully", deletedContinent });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
// GET route to search continents by name
router.get('/search-continents', async (req, res) => {
    try {
        const { name } = req.query;

        if (!name) {
            return res.status(400).json({ message: "Please provide a name to search" });
        }

        const continents = await ContinentSchema.find({
            name: { $regex: name, $options: "i" }, // Case-insensitive partial match
        });

        res.status(200).json(continents);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


module.exports = router;
