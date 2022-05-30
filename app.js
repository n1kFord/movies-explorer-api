const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const {
  errors,
} = require('celebrate');
const rateLimit = require('express-rate-limit');
const { requestLogger, errorLogger } = require('./middlewares/logger');

require('dotenv').config();

const { PORT = 3000, BASE_LINK = 'mongodb://localhost:27017/moviesdb' } = process.env; // берет с .env если файл существует
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect(BASE_LINK, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use(requestLogger);
app.use(helmet());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  const { method } = req;
  const DEFAULT_ALLOWED_METHODS = 'GET,HEAD,PUT,PATCH,POST,DELETE';
  const requestHeaders = req.headers['access-control-request-headers'];
  if (method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', DEFAULT_ALLOWED_METHODS);
    res.header('Access-Control-Allow-Headers', requestHeaders);
    return res.end();
  }
  return next();
});

app.use(
  rateLimit({
    windowMs: 12 * 60 * 60 * 1000,
    max: 100,
    message: 'Вы превысили количество запросов за 12 часов!',
    headers: true,
  }),
);

app.use(require('./routes/index')); // все роуты

app.use(errorLogger);

app.use(errors());

app.use(require('./middlewares/error-handler')); // централизованный обработчик ошибок

app.listen(PORT);
