const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./Config/DbConnection');
const cookieParser = require('cookie-parser');

const app = express();
dotenv.config();

 app.use(cookieParser()); // Parse cookies

app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true }));
 // Parse URL-encoded form data
//routes
const adminRoutes = require('./Routes/AdminRoutes');
app.use('/api/admin', adminRoutes);
app.get('/', (req, res) => {
          res.send('Welcome to the backend server of GEM Controller');
});
//start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
          console.log(`Server is running on port ${PORT}`);});




