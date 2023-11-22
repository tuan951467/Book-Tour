const userController = require('../controllers/user.controller');
const authController = require('../controllers/auth.controller');
const express = require('express');

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.patch('/reset-password/:token', authController.resetPassword);
router.patch(
  '/update-password',
  authController.protect,
  authController.updatePassword
);

// Protect all routes after this middleware
router.use(authController.protect);

router.get('/me', userController.getCurrentUser, userController.getUser);
router.patch('/', userController.updateCurrentUser);
router.delete('/', userController.deleteCurrentUser);

router.use(authController.restrictTo('admin'));

router.get('/', userController.getAllUsers);
router.get('/users/:id', userController.getUser);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

module.exports = router;
