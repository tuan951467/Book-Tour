const User = require('../models/user.model');
const catchAsync = require('../utils/catchAsync');
const factory = require('../utils/handlerFactory');
const AppError = require('../utils/appError');
const multer = require('multer');
const sharp = require('sharp');

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, 'public/img/users');
//   },
//   filename: function (req, file, cb) {
//     const ext = file.mimetype.split('/')[1];
//     const uniqueSuffix = Date.now();
//     cb(null, `user-${req.user.id}-${uniqueSuffix}.${ext}`);
//   },
// });

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    // To accept the file pass `true`, like so:
    cb(null, true);
  } else {
    // You can always pass an error if something goes wrong:
    cb(new AppError('Not an image. Please upload only images', 400), false);
  }
};
const upload = multer({ storage: storage, fileFilter: fileFilter });
exports.uploadUserImage = upload.single('photo');

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer)
    .resize(128, 128)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);

  next();
});

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
  console.log(req.body);
  console.log(req.file);
  if (req.body.password || req.body.passwordConfirm)
    return next(
      new AppError(
        'This route is not for password updates. Please use /update-password'
      )
    );

  const filterBody = filterObj(req.body, 'name', 'email');
  if (req.file) filterBody.photo = req.file.filename;

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
