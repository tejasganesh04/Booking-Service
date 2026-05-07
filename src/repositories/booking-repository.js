const {StatusCodes} = require('http-status-codes')
const AppError = require('../utils/errors/app-error');
const {Booking} = require('../models');
const CrudRepository = require('./crud-repository');
const {Op} = require('sequelize');
const { ENUMS } = require('../utils/common')
const {BOOKED,CANCELLED,INITIATED} = ENUMS.BOOKING_STATUS;


class BookingRepository extends CrudRepository{
    constructor(){
        super(Booking);
    }

    async createBooking(data,transaction){
        const response =  await Booking.create(data,{transaction:transaction});
        return response;
    }
    
    async get(data,transaction){
       
            const response = await this.model.findByPk(data,{transaction:transaction});
            if(!response){
                throw new AppError('Not able to find a resource',StatusCodes.NOT_FOUND);
            }
            return response;
        
    }

    async update(data, id, transaction) {
    const response = await this.model.update(data, {
        where: { id: id },
        transaction: transaction
    });
    if(response[0] == 0) {
        throw new AppError('Resource to be updated not found', StatusCodes.NOT_FOUND);
    }
    return response;
}


async cancelOldBookings(timestamp){
    const response = await Booking.update(
        { status: CANCELLED },
        {
            where: {
                [Op.and]:[
                    {
                createdAt: { [Op.lt]: timestamp }
                },
                {
                    status: {[Op.ne]:BOOKED}
            },
            {
                status:{
                    [Op.ne]:CANCELLED
                }
            }
        ]

            }
        }
    );
    return response;
}


}





module.exports = BookingRepository;
