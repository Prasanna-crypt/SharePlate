const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  if (err.name === 'ValidationError') {
    return res.status(400).json({ message: Object.values(err.errors).map(e => e.message).join(', ') });
  }
  if (err.code === 11000) {
    return res.status(400).json({ message: 'Duplicate field value' });
  }
  if (err.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid ID format' });
  }
  res.status(err.statusCode || 500).json({ message: err.message || 'Internal Server Error' });
};

module.exports = errorHandler;
