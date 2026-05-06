
const {StatusCodes} = require('http-status-codes')
const BookingService = require('../services/booking-service')
const {SuccessResponse,ErrorResponse} = require('../utils/common');

async function createBooking(req,res){
    try {
        console.log(req.body)
        const response = await BookingService.createBooking({
            flightId: req.body.flightId,//mandatory
            noofSeats: req.body.noofSeats,//mandatory
            userId: req.body.userId
        });
        SuccessResponse.data= response;
        return res.status(StatusCodes.OK).json(SuccessResponse)
    } catch (error) {
        console.log(error)
        ErrorResponse.error = error;
        return res.status(error.statusCode).json(ErrorResponse);
    }

}





module.exports = {
createBooking
}