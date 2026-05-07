const cron = require('node-cron');

const {BookingService} = require('../../services/');

function scheduleCrons(){
cron.schedule('*/2 * * * *', async () => {//srcipt that should check all bookings older than 2 mins, a janitor
    const response = await BookingService.cancelOldBookings();
    console.log(response);
});
}

module.exports = scheduleCrons;



