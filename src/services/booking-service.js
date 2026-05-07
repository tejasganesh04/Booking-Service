//heavy level of business logic this time comp too the flight service

const axios = require('axios')

const {BookingRepository} = require('../repositories');

const{ServerConfig} = require('../config')
const db = require('../models');
const AppError = require('../utils/errors/app-error');
const { StatusCodes } = require('http-status-codes');
const bookingRepository = new BookingRepository()
const { ENUMS } = require('../utils/common')
const {BOOKED,CANCELLED} = ENUMS.BOOKING_STATUS;





async function createBooking(data){//we will do managed transaction //sequelize docs has great explanation

    const transaction = await db.sequelize.transaction();
    try{   
            const flight = await axios.get(`${ServerConfig.FLIGHT_SERVICE}/api/v1/flights/${data.flightId}`)//we make call to address where flight service is hossted,replace rawstring later,using for now
            const flightData = flight.data.data;
            
            if(data.noofSeats > flightData.totalSeats){//s ince managed trans, rolls back txn immediately when we throw an error
       throw new AppError('Not enough seats available', StatusCodes.BAD_REQUEST);
            }
            const totalBillingAmount = data.noofSeats * flightData.price
            const bookingPayload = {...data,totalCost: totalBillingAmount};

            const booking = await bookingRepository.create(bookingPayload,transaction) // creates a temporary booking in an initiated state. the flow is you reserve seats, give some time to the user to complete payment. there is no payments service but still
            //now that booking is created, good time to reserve seats
            const response = await axios.patch(`${ServerConfig.FLIGHT_SERVICE}/api/v1/flights/${data.flightId}/seats`,{
                seats: data.noofSeats
            })//if api call works u successfully reduced the no of seats
            
            await transaction.commit();//currently no db query inside createBooking
            return true;
    }catch(error){
        await transaction.rollback();
        console.log(error);
        throw error;
    }
}


async function makePayment(data){ // mimicing a payment gateway - in real world this will be a designated payments service
    const transaction = await db.sequelize.transaction();
    try {
        const bookingDetails = await bookingRepository.get(data.bookingId);
        if(bookingDetails.status == CANCELLED){
            throw new AppError('The booking has expired',StatusCodes.BAD_REQUEST);
        }
        const bookingTime = new Date(bookingDetails.createdAt);
        const currentTime = new Date();
        if(currentTime - bookingTime > 300000){ // now cancel that booking
            await cancelBooking(data.bookingId);
            throw new AppError('The booking has expired',StatusCodes.BAD_REQUEST);
            
        }





        if(bookingDetails.totalCost != data.totalCost){
            throw new AppError('The amount of the payment doesnt match',StatusCodes.BAD_REQUEST);
        }

        if(bookingDetails.userId!=data.userId){
            throw new AppError('The user corresponding to the booking doesnt match',StatusCodes.BAD_REQUEST );
        } 
        //we assume that here, the payment is successful
        const response = await bookingRepository.update({status:BOOKED},data.bookingId,transaction);
        await transaction.commit();
        
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
}

async function cancelBooking(bookingId){
    const transaction = await db.sequelize.transaction();
    try {
         const bookingDetails = await bookingRepository.get(bookingId,transaction);
         if(bookingDetails.status == CANCELLED){
            await transaction.commit();
            return true;
         }
          await axios.patch(`${ServerConfig.FLIGHT_SERVICE}/api/v1/flights/${bookingDetails.flightId}/seats`,{
                seats: bookingDetails.noOfSeats,
                dec:0
            })

            await bookingRepository.update({status:CANCELLED}, bookingId, transaction);
            await transaction.commit();

    } catch (error) {
        
        await transaction.rollback();
        throw error;
    }
}

async function cancelOldBookings(timestamp){
try {
    const time = new Date(Date.now() - 1000*300);//time 5 mins ago
    const response = await bookingRepository.cancelOldBookings(time);
    return response;
} catch (error) {
    console.log(error);
}
}




module.exports = {
createBooking,
makePayment,
cancelBooking,
cancelOldBookings
}