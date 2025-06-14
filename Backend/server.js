const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./Config/DbConnection");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const adminRoutes = require("./Routes/AdminRoutes");

const app = express();

dotenv.config();

(async () => {
  try {
    // Connect to database
    await connectDB();
    console.log("Connected to MongoDB");

    app.use(cookieParser()); // Parse cookies

    // CORS setup with credentials
    app.use(
      cors({
        origin: "http://localhost:5173",
        methods: ["GET", "POST", "PUT", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: true, // Added to allow credentials
      })
    );

    app.use(express.json()); // Parse JSON bodies
    app.use(express.urlencoded({ extended: true }));

    // Routes
    app.use("/api/admin", adminRoutes);

    app.get("/", (req, res) => {
      res.send("Welcome to the backend server of GEM Controller");
    });

    // Start the server
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server startup error:", error);
    process.exit(1); // Exit on failure
  }
})();
