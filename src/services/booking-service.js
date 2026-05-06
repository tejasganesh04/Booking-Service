//heavy level of business logic this time comp too the flight service

const axios = require('axios')

const {BookingRepository} = require('../repositories');

const{ServerConfig} = require('../config')
const db = require('../models');
const AppError = require('../utils/errors/app-error');
const { StatusCodes } = require('http-status-codes');
const bookingRepository = new BookingRepository()





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

module.exports = {
createBooking
}