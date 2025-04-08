const express=require('express');
const router=express.Router();
const mongoose=require('mongoose');
const upload=require('../middlerwares/multer');

const {CountrySchema}=require("../models/LocationSchema");


router.post("/add-country",upload.single("flagImg"), async(req,res)=>
{
    try {
        const {name,shortName,status,continentId}=req.body;

        let flagImg=req.file ? `${req.file.filename}`:null;
         console.log(flagImg);
               
        if(!continentId)
            {
               return res.status(400).json({message:"continent not found"});
            }

        if(!name|| !shortName|| !status)
            {
               return res.status(400).json({message:"pls provide all field"})
            }

            const country=new CountrySchema({
                name,
                shortName,
                status,
                flagImg,
                continentId,
            });

            await country.save();

            res.status(201).json({message:"country successfully created",country});

    } catch (error) {
        
        res.status(500).json({message:error.message});
    }
})



router.get("/get-countries", async (req, res) => {
    try {
      const { continentId } = req.query; // Query parameter for filtering
      let filter = {};
      if (continentId) {
        filter.continentId = continentId;
      }
  
      const countries = await CountrySchema.find(filter).populate("continentId", "name"); // Populating continent details
  
      if (!countries.length) {
        return res.status(404).json({ message: "No countries found" });
      }
  
      res.status(200).json(countries);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  
module.exports=router;