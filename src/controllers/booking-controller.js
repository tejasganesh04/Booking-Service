
/*
 * Booking Controller
 *
 * Sits between the routes and the service layer.
 * Responsibilities:
 *  - Extract and validate request data from req.body
 *  - Call the appropriate BookingService function
 *  - Send a standardised success or error response back to the client
 *
 * It does NOT contain any business logic — that lives in the service layer.
 */

const {StatusCodes} = require('http-status-codes')
const BookingService = require('../services/booking-service')
const {SuccessResponse,ErrorResponse} = require('../utils/common');

/*
 * createBooking
 *
 * Receives:  POST /api/v1/booking
 *   req.body: {
 *     flightId  (required) — which flight to book
 *     noofSeats (required) — how many seats the user wants
 *     userId    (optional) — who is making the booking
 *   }
 *
 * Calls:     BookingService.createBooking()
 *
 * Responds:
 *   200 OK    — booking created successfully, returns true
 *   400/500   — not enough seats, flight not found, or unexpected error
 */
async function createBooking(req,res){
    try {

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
        // fallback to 500 if error is not an AppError (no statusCode property)
        return res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
    }

}


/*
 * makePayment
 *
 * Receives:  POST /api/v1/booking/payment
 *   req.body: {
 *     bookingId (required) — the booking to complete payment for
 *     userId    (required) — must match the userId on the booking
 *     totalCost (required) — must match the totalCost stored on the booking
 *   }
 *
 * Calls:     BookingService.makePayment()
 *
 * Responds:
 *   200 OK    — payment confirmed, booking status updated to BOOKED
 *   400       — booking expired, cost mismatch, userId mismatch
 *   500       — unexpected server error
 */
async function makePayment(req,res){
    try {
        console.log(req.body)
        const response = await BookingService.makePayment({
           bookingId: req.body.bookingId,
            userId: req.body.userId,
            totalCost:req.body.totalCost
        });
        SuccessResponse.data= response;
        return res.status(StatusCodes.OK).json(SuccessResponse)
    } catch (error) {
        ErrorResponse.error = error;
        // fallback to 500 if error is not an AppError (no statusCode property)
        return res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
    }

}





module.exports = {
createBooking,
makePayment
}