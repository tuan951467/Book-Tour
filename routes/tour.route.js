const tourController = require('../controllers/tour.controller');
const authController = require('../controllers/auth.controller');
const reviewRouter = require('./review.route');
const express = require('express');

const router = express.Router();

router.use('/:tourId/reviews', reviewRouter);
router.get(
  '/top-5-tours',
  tourController.aliasTopTours,
  tourController.getAllTours
);
router.get('/tour-stats', tourController.getTourStats);

router.get(
  '/monthly-plan/:year',
  authController.protect,
  authController.restrictTo('admin', 'lead-guide', 'guide'),
  tourController.getMonthlyPlan
);

// /tours-within?distance=233&center=-40,45&unit=mi
// /tours-within/233/center/-40,45/unit/mi
router.get(
  '/tours-within/:distance/center/:latlng/unit/:unit',
  tourController.getToursWithin
);

router.get('/distances/:latlng/unit/:unit', tourController.getDistances);

router.get('/', tourController.getAllTours);
router.get('/:id', tourController.getTour);

router.post(
  '/',
  authController.protect,
  authController.restrictTo('admin', 'lead-guide'),
  tourController.createTour
);

router.put(
  '/:id',
  authController.protect,
  authController.restrictTo('admin', 'lead-guide'),
  tourController.uploadTourImages,
  tourController.resizeTourImages,
  tourController.updateTour
);

router.delete(
  '/:id',
  authController.protect,
  authController.restrictTo('admin', 'lead-guide'),
  tourController.deleteTour
);

module.exports = router;
