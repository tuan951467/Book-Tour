const express = require('express');
const reviewController = require('../controllers/review.controller');
const authController = require('../controllers/auth.controller');

const router = express.Router({ mergeParams: true });

router.use(authController.protect);

router.get('/', reviewController.getAllReviews);
router.post(
  '/',
  authController.restrictTo('user'),
  reviewController.setTourUserIds,
  reviewController.createReview
);
router.get('/:id', reviewController.getReview);
router.patch(
  '/:id',
  authController.restrictTo('admin', 'user'),
  reviewController.updateReview
);
router.delete(
  '/:id',
  authController.restrictTo('admin', 'user'),
  reviewController.deleteReview
);
module.exports = router;
