/*
 * Booking resource routes.
 * Base path: /api/v1/booking
 *
 * POST /              → createBooking
 *   Body: { flightId, noofSeats, userId }
 *   Creates a new booking in INITIATED state and reserves seats on the flight service.
 *
 * POST /payment       → makePayment
 *   Body: { bookingId, userId, totalCost }
 *   Validates and confirms payment for an existing booking, marking it as BOOKED.
 */

const express = require('express');
const { BookingController } = require('../../controllers');
const { idempotencyMiddleware } = require('../../middlewares');
const router = express.Router();

router.post('/', BookingController.createBooking);

// makePayment is protected by idempotency middleware
// Client must send a unique Idempotency-Key header (UUID) with every payment request
router.post('/payment', idempotencyMiddleware, BookingController.makePayment);

module.exports = router;
