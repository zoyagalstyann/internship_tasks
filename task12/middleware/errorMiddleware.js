const errorMiddleware = (err, req, res, next) => {
    console.error(err);
  
    if (err.status) {
      return res.status(err.status).json({
        message: err.message
      });
    }
  
    if (err instanceof SyntaxError) {
      return res.status(500).json({
        message: "Invalid JSON in tasks file"
      });
    }
  
    res.status(500).json({
      message: "Something went wrong"
    });
  };
  
  module.exports = errorMiddleware;