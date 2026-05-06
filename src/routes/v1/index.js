const express = require('express');


const bookingRoutes = require('./booking');
const router = express.Router()




router.use('/booking', bookingRoutes);

 
module.exports = router;