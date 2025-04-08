require("dotenv").config();
const express = require("express");
const UserSchema = require("../models/UserSchema");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const router = express.Router();
const multer = require('multer');

// for mail
const crypto = require('crypto');
const nodemailer = require('nodemailer');

// Nodemailer transporter setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'your-email@gmail.com',
    pass: 'your-email-password',
  },
});


// Function to generate JWT token
const generateToken = (user) => {
  try {
    const token = jwt.sign({ id: user._id, email: user.email }, process.env.SECRET_TOKEN, { expiresIn: "24h" });
    return token;
  } catch (error) {
    console.error("Error generating token:", error);
    throw error;
  }
};

const verifyToken=(req,res,next)=>
  {
    let token=req.headers['authorization'];
    if(token)
      {
        token=token.split(' ')[1];
        jwt.verify(token,process.env.SECRET_TOKEN,(err,valid)=>
        {
          if(err)
            {
              res.status(404).json({message:"pls provide valid token"});
            }
            else
            {
              next();
            }
        })
      }
      else
      {
        res.status(400).json({message:"pls add token with header"})
      }
  }

  // Multer setup for file upload
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "uploads"); // Define the upload folder
    },
    filename: (req, file, cb) => {
      cb(null, file.fieldname + "_" + Date.now() + ".jpg"); // Define file naming convention
    }
  })
}).single("user_file"); // The name of the field used in the form (in the frontend)

const path = require('path');

// Add Admin route
router.post("/add-admin", verifyToken,upload,async (req, res) => {
  try {
    const { name, email, password, mobile,userType,status} = req.body;

      // Ensure that image is included from the file upload
      if (!req.file) {
        return res.status(400).json({ message: "Please upload an image." });
      }
  
      const profileImg = req.file.path; // Multer stores the file path in req.file.path
  
    console.log(name,email,password,mobile,userType,status,profileImg);
    if (!name || !email || !password || !mobile || !userType || !status)  {
      return res.status(400).json({ message: "Please provide all fields" });
    }

    const emailExists = await UserSchema.findOne({email});
    const mobileExists = await UserSchema.findOne({mobile});

    if (emailExists || mobileExists) {
      return res.status(400).json({ message: "Admin already exists" });
    }
    

    const user = new UserSchema({
      name,
      email,
      password,  // Password should be hashed before saving
      mobile,
      userType,
      status,
      profileImg:req.file.filename,
    });

    await user.save();

    res.status(201).json({
      message: "Admin registered successfully",
      user,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get Admin route

router.get("/get-admins", verifyToken,async(req,res)=>
{
  try {
         const admins= await UserSchema.find();
         res.status(200).json({message:"admin get successfully", admins})    
    
  } catch (error) {
    res.status(400).json({message:"admin not found"});
  }
})

// delete a admin route

router.delete("/del-admin/:id", verifyToken,async(req,res)=>
{

  try {
    const admins=await UserSchema.find();
    console.log(admins.length);
    if(admins.length<2)
      {
         return res.status(400).json({message:"this is last admin"});
      }
        const admin= await UserSchema.findByIdAndDelete(req.params.id);

     

    if(!admin)
      {
        return res.status(400).json({message:"Admin not found"});
      }
      return res.status(200).json({message:"Admin delete successfuly"});
    
  } catch (error) {
    res.status(400).json({message:error.message});
  }
})



// GEt admin one route 

router.get("/get-admin/:id", verifyToken,async(req,res)=>
{
  try {
    const admin =await UserSchema.findById(req.params.id);
    console.log(admin)
    if(!admin)
      {
        return res.status(400).json({message:"admin not found"});
      }
      else
      {
        return res.status(200).json(admin);

      }
  } catch (error) {
    
    res.status(500).json({message:error.message});
  }
})


// Update Admin route
router.put("/update-admin/:id", verifyToken, upload, async (req, res) => {
  try {
    const { name, email, password, mobile, userType, status } = req.body;
    const adminId = req.params.id; // Get the admin ID from the URL parameter

    // Find the admin by ID
    const user = await UserSchema.findById(adminId);
    if (!user) {
      return res.status(404).json({ message: "Admin not found" });
    }

    // If a new image is uploaded, update it
    let profileImg = user.profileImg; // Keep the existing profile image initially
    if (req.file) {
      // If a new image is uploaded, update the profile image field
      profileImg = req.file.filename; // Multer stores the file name in req.file.filename
    }

    // Update the user's details
    user.name = name || user.name;
    user.email = email || user.email;
    user.password = password || user.password; // Hash password before saving (not done here for simplicity)
    user.mobile = mobile || user.mobile;
    user.userType = userType || user.userType;
    user.status = status || user.status;
    user.profileImg = profileImg;

    // Save the updated admin details
    await user.save();

    res.status(200).json({
      message: "Admin updated successfully",
      user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});


// Update Admin route
// Update Admin route
router.put("/update-password/:id", verifyToken, upload, async (req, res) => {
  try {
    const {password,confirmPassword } = req.body;
    const adminId = req.params.id; // Get the admin ID from the URL parameter

    // Find the admin by ID
    const user = await UserSchema.findById(adminId);
    if (!user) {
      return res.status(404).json({ message: "Admin not found" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    // Update the user's details
    user.password = password || user.password; // Hash password before saving (not done here for simplicity)
  
    // Save the updated admin details
    await user.save();

    console.log(user.password);
    res.status(200).json({
      message: "password updated successfully",
      user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
})

router.post("/forget-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Please provide email" });
    }

    // Check if the user exists
    const checkUser = await UserSchema.findOne({ email });

    if (!checkUser) {
      return res.status(400).json({ message: "User not found, please register" });
    }

    // Generate the reset token using JWT
    const token = jwt.sign({ email: checkUser.email, id: checkUser._id }, process.env.SECRET_TOKEN, { expiresIn: '1h' });

    // Create the reset password link
    const resetLink = `${process.env.CLIENT_URL}/${token}`;
    // Set up the email transporter (Gmail service)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.MY_GMAIL, // From environment variables
        pass: process.env.MY_PASS,   // From environment variables
      },
    });

    // Define the email content
    const receiver = {
      from: process.env.MY_GMAIL,  // From email (make sure this is the same one as used in auth)
      to: email,                   // Recipient's email
      subject: 'Password Reset Request',
      text: `Click on this link to reset your password:${resetLink}`,
    };

    // Send the reset password email
    await transporter.sendMail(receiver);

    // Send a success response
    return res.status(200).json({ message: "Password reset link sent successfully to your email" });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
});

router.post("/reset-password/:token", async(req,res)=>
{
  try {
    const {token}=req.params;
    const {password}=req.body;

    console.log(token)
    console.log(password)
    if(!password)
      {
        return res.status(400).json({message:"please provide password"})
      }

      const decode=jwt.verify(token,process.env.SECRET_TOKEN);
      const user=await UserSchema.findOne({email:decode.email});
      user.password=password;
      await user.save();
      return res.status(200).json({message:"password reset successfully"})
    
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message});
  }
})
// Login route
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
     console.log(email,password)
    if (!email || !password) {
      return res.status(400).json({ message: "Please provide both fields" });
    }

    const user = await UserSchema.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    const token = generateToken(user);

    res.status(200).json({
      message: "Login successful",

      accessToken:token,
      tokenType:'bearer',
      user: user,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});


module.exports = router;
