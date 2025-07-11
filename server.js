const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet'); // Add this line
require('dotenv').config();

const productRoutes = require('./routes/products');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');

const app = express();
const PORT = process.env.PORT || 3000;

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

// Middleware
app.use(limiter);
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Add this before other middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "https://cdn.jsdelivr.net", "'unsafe-inline'", "'unsafe-eval'"], // Added unsafe-eval
      styleSrc: ["'self'", "https://cdnjs.cloudflare.com", "https://fonts.googleapis.com", "'unsafe-inline'"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "https://via.placeholder.com", "data:"],
      connectSrc: ["'self'"]
    },
  },
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);

// Serve main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Serve login page
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});