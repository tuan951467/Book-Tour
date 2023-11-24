const path = require('path');
const express = require('express');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const mongoose = require('mongoose');
require('dotenv').config();
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const helmet = require('helmet');
const xss = require('xss-clean');
const hpp = require('hpp');
const cors = require('cors');

const app = express();

const tourRoutes = require('./routes/tour.route');
const userRoutes = require('./routes/user.route');
const reviewRoutes = require('./routes/review.route');
const bookingRoutes = require('./routes/booking.route');
const globalErrorHandler = require('./utils/error');
const AppError = require('./utils/appError');
const viewRoutes = require('./routes/views.route');

app.use(helmet());

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// Serving static files
app.use(express.static(path.join(__dirname, 'public')));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

app.use(cookieParser());
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

app.use(
  '/api',
  rateLimit({
    max: 100,
    WindowMS: 60 * 60 * 100,
    message: 'Too many requests from this IP. Please try again in an hour',
  })
);
app.use(cors());
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

app.use('/', viewRoutes);
app.use('/api/v1/tours', tourRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/reviews', reviewRoutes);
app.use('/api/v1/bookings', bookingRoutes);

app.all('*', (req, res, next) => {
  const message = `Can't find ${req.originalUrl} on this server`;
  next(new AppError(message, 404));
});

app.use(globalErrorHandler);
