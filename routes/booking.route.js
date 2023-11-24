const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const bookingController = require('../controllers/booking.controller');

// router.use(authController.protect)
// router.use(authController.restrictTo('admin', 'lead-guide'))

router.get('/', bookingController.getAllBookings);
router.get('/:id', bookingController.getBooking);
router.post('/', bookingController.createBooking);
router.put('/:id', bookingController.updateBooking);
router.delete('/:id', bookingController.deleteBooking);

module.exports = router;
