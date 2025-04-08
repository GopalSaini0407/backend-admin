const express = require("express");
const dotenv = require("dotenv");
const app = express();
const cors = require('cors');
const connectDB = require("./config/db");
const path = require('path');


const userRoutes = require("./routes/userRoute");
const hotelRoutes = require("./routes/hotelRoute");
const roomRoutes=require("./routes/roomRoute");
const amenityRoutes=require("./routes/amenityRoute");
const continentRoutes=require("./routes/continentRoute");
const countryRoutes=require("./routes/countryRoute");

dotenv.config();  // Load environment variables
connectDB();  // Connect to MongoDB

// Middleware
app.use(express.json());  // Using express's built-in json middleware
app.use(cors());
const corsOptions = {
  // origin: 'http://localhost:3000',  // Replace with your React frontend URL
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,  // If you need to allow cookies with requests
};

app.use(cors(corsOptions));  // Use the CORS configuration here
// Serve static files from the 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const hostname = '127.0.0.1';
const PORT = process.env.PORT || 5000;

// Basic route to avoid "Cannot GET /"
app.get("/", (req, res) => {
  res.send("Welcome to the server!");
});

// Routes
    app.use("/api/users", userRoutes);
   app.use("/api/hotels", hotelRoutes);
   app.use("/api/hotels", roomRoutes);
   app.use("/api/hotels",amenityRoutes);
   app.use("/api/locations",continentRoutes);
   app.use("/api/locations",countryRoutes);

// Listen on a specific port
app.listen(PORT,hostname, () => {
  console.log(`Server running at http://${hostname}:${PORT}/`);
});