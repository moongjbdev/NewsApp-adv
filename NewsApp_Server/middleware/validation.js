// Simple validation middleware
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password) => {
  return password && password.length >= 6;
};

const validateUsername = (username) => {
  return username && username.length >= 3 && username.length <= 30;
};

const validateComment = (content) => {
  return content && content.trim().length > 0 && content.length <= 1000;
};

// Validation middleware functions
const validateRegistration = (req, res, next) => {
  const { username, email, password, fullName } = req.body;

  if (!username || !validateUsername(username)) {
    return res.status(400).json({ message: 'Username must be 3-30 characters long' });
  }

  if (!email || !validateEmail(email)) {
    return res.status(400).json({ message: 'Please provide a valid email' });
  }

  if (!password || !validatePassword(password)) {
    return res.status(400).json({ message: 'Password must be at least 6 characters long' });
  }

  if (!fullName || fullName.trim().length === 0) {
    return res.status(400).json({ message: 'Full name is required' });
  }

  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !validateEmail(email)) {
    return res.status(400).json({ message: 'Please provide a valid email' });
  }

  if (!password) {
    return res.status(400).json({ message: 'Password is required' });
  }

  next();
};

const validateCommentInput = (req, res, next) => {
  const { content, article_id } = req.body;

  if (!article_id) {
    return res.status(400).json({ message: 'Article ID is required' });
  }

  if (!validateComment(content)) {
    return res.status(400).json({ message: 'Comment content must be 1-1000 characters long' });
  }

  next();
};

module.exports = {
  validateRegistration,
  validateLogin,
  validateCommentInput,
  validateEmail,
  validatePassword,
  validateUsername,
  validateComment
}; 