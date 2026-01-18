// Express server entry point
// Core logic intentionally omitted for public version

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const multer = require('multer');
const fs = require('fs');

const app = express();

// Middleware configuration
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
const cors = require("cors");
app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:3001"],
  credentials: true
}));
app.use(express.json());
const cookieParser = require('cookie-parser');
app.use(cookieParser());

// MongoDB connection
// Core connection logic intentionally omitted for public version
mongoose.connect('mongodb://127.0.0.1:27017/attend-ease')
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.log(err));

// Route handlers
// Core API routes and business logic intentionally omitted for public version

app.listen(5000, () => {
  console.log('server is running on port 5000, http://localhost:5000');
});
