
/*
 * Entry point of the Booking Service.
 *
 * Responsibilities:
 *  - Spins up the Express server on the configured PORT
 *  - Mounts all API routes under /api
 *  - Starts all background cron jobs AFTER the server is live
 *
 * Why cron is started inside app.listen callback:
 *  - Ensures all modules are fully loaded before the cron fires its first tick,
 *    avoiding any potential race conditions with module initialization.
 */

const express = require('express');
const {ServerConfig,Logger} = require('./config'); // auto-picks config/index.js
const apiRoutes = require('./routes');
const CRON = require('./utils/common/cron-jobs');
const app = express();

// Parse incoming JSON bodies (for raw JSON requests)
app.use(express.json())
// Parse URL-encoded bodies (for form submissions / x-www-form-urlencoded)
app.use(express.urlencoded({extended:true}));

// Mount all versioned API routes under /api  →  /api/v1/...
app.use('/api', apiRoutes)

app.listen(ServerConfig.PORT,()=>{
    console.log(`Successfully started server on PORT : ${ServerConfig.PORT}`);
    //Logger.info("Successfully started the server",{});

    // Start background cron jobs after server is live
    CRON();
})