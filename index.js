const express = require('express');
const app = express();
const mongoose = require('mongoose');
const dotenv = require('dotenv').config();
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const tourRoutes = require('./routes/tour.route');
const userRoutes = require('./routes/user.route');
const reviewRoutes = require('./routes/review.route');
const globalErrorHandler = require('./controllers/error.controller');
const AppError = require('./utils/appError');

app.use(helmet());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
app.use(express.json({ limit: '10kb' }));

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against xss
app.use(xss());

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'maxGroupSize',
      'difficulty',
      'ratingsAverage',
      'ratingsQuantity',
      'price',
    ],
  })
);

app.use(cors());
app.use(
  '/api',
  rateLimit({
    max: 100,
    WindowMS: 60 * 60 * 100,
    message: 'Too many requests from this IP. Please try again in an hour',
  })
);

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('DB connection successfully');
  } catch (error) {
    console.log(error);
  }
};

connectDB();

const port = 3000;
app.listen(port, () => {
  console.log(`App running on port ${port}`);
});

app.use('/api/v1/tours', tourRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/reviews', reviewRoutes);

app.all('*', (req, res, next) => {
  const message = `Can't find ${req.originalUrl} on this server`;
  next(new AppError(message, 404));
});

app.use(globalErrorHandler);
