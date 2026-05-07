const SEAT_TYPE = {
    BUSINESS: 'business',
    ECONOMY : 'economy',
    FIRST_CLASS:'first-class',
    PREMIUM_ECONOMY:'premium-economy'
}

const BOOKING_STATUS = {
    BOOKED : 'booked',
    CANCELLED: 'cancelled',
    INITIATED: 'initiated',
    PENDING: 'pending' // we are using it as a placeholder for a real payments service but actually we dont use it
}


module.exports = {
    SEAT_TYPE,
    BOOKING_STATUS
}