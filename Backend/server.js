const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./Config/DbConnection");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const adminRoutes = require("./Routes/AdminRoutes");
const app = express();
const path = require("path");

dotenv.config();

app.use(
  cors({
    origin: "http://localhost:5173", // Replace with your frontend URL
    credentials: true, // Allow credentials (cookies, authorization headers, etc.)
  })
);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/Uploads", express.static(path.join(__dirname, "Uploads")));
app.use("/api/admin", adminRoutes);

const PORT = process.env.PORT || 5000;
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Failed to connect to the database:", error);
  });
