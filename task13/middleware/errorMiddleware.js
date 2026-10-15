
function errorMiddleware(error, req, res, next) {
  console.error(error.message);

  if (res.headersSent) {
    return next(error);
  }

  res.status(500).json({
    message: "Internal server error"
  });
}

module.exports = errorMiddleware;
