/* NOT FOUND Error Handler */

const notfound = (req, res, next) => {
  const error = new Error(` Route Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

/* ERROR Handler */

const handerError = (error, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  res.status(statusCode);

  res.json({
    status: false,
    message: error?.message,
    stack: error?.stack,
  });
};
module.exports = { handerError, notfound };
