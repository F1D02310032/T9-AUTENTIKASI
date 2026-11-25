require('dotenv').config();

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET wajib diatur di file .env');
}

const express = require('express');
const authRoutes = require('./routes/authRoutes');
const movieRoutes = require('./routes/movieRoutes');
const genreRoutes = require('./routes/genreRoutes');
const screeningRoutes = require('./routes/screeningRoutes');
const { logger } = require('./middleware/logger');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();
const port = process.env.PORT || 3000;

app.use(logger);
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/movies', movieRoutes);
app.use('/genres', genreRoutes);
app.use('/screenings', screeningRoutes);

app.use(notFound);
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Movies API berjalan di http://localhost:${port}`);
});
