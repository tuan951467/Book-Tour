const User = require('../models/user.model');
const catchAsync = require('../utils/catchAsync');
const factory = require('../utils/handlerFactory');
const AppError = require('../utils/appError');

const filterObj = (obj, ...allowFields) => {
  const newObj = {};

  Object.keys(obj).forEach((el) => {
    if (allowFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

// GET api/v1/users
exports.getAllUsers = factory.getAll(User);
// GET api/v1/users/:id
exports.getUser = factory.getOne(User);
// PUT api/v1/users/:id
exports.updateUser = factory.updateOne(User);
// DELETE api/v1/users/:id
exports.deleteUser = factory.deleteOne(User);

exports.getCurrentUser = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};
// PATCH api/v1/users
exports.updateCurrentUser = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm)
    return next(
      new AppError(
        'This route is not for password updates. Please use /update-password'
      )
    );

  const filterBody = filterObj(req.body, 'name', 'email', 'photo');
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filterBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

// DELETE api/v1/users
exports.deleteCurrentUser = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });
  res.status(204).json({ status: 'success', data: null });
});
