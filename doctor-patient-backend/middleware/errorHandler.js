export const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
};

export const notFound = (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
};

// Future middleware for logging request details (e.g., analytics or debugging)
export const logRequestDetails = (req, res, next) => {
  // Placeholder: Will log method, URL, and timestamp in future
  next();
};
