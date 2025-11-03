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
    origin: ["http://13.233.204.102:3002", "http://13.233.204.102", "http://localhost:5173"],
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));



app.use("/Uploads", express.static(path.join(__dirname, "Uploads")));
app.use("/api/admin", adminRoutes);



app.use(express.static(path.join(__dirname, "../Frontend-gem/GemControl/dist")));

console.log("Serving static files from:", path.join(__dirname, "../Frontend-gem/GemControl/dist"));


app.get("*", (req, res) => {
  res.sendFile(
    path.join(__dirname, "../Frontend-gem/GemControl/dist/index.html")
  );
});

app.get('/hello', (req, res) => {
  res.send('Hello, World!');
});




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

// error hendler
app.use((err, req, res, next) => {
  console.error(err.message);
  res.status(500).send("Something broke!");
});
