const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const User = require('../models/user');
const NotFoundError = require('../errors/not-found-error');
const BadRequestError = require('../errors/bad-request-error');
const ConflictError = require('../errors/conflict-error');
const UnauthorizedError = require('../errors/unauthorized-error');

const { NODE_ENV, JWT_SECRET } = process.env;

module.exports.createUser = (req, res, next) => {
  const {
    name, email, password,
  } = req.body;
  if (!validator.isEmail(email) || !password) {
    next(new BadRequestError('Ошибка: данные переданы неккоректно.'));
  } else {
    bcrypt.hash(password, 10)
      .then((hash) => User.create({
        name, email, password: hash,
      }))
      .then((user) => {
        res.send({
          name: user.name, email: user.email,
        });
      })
      .catch((err) => {
        if (err.code === 11000) {
          next(new ConflictError('Ошибка: пользователь с таким e-mail уже существует.'));
        } else {
          next(err);
        }
      });
  }
};

module.exports.changeUserInfo = (req, res, next) => {
  const { email, name } = req.body;
  if (!email || !name) {
    next(new BadRequestError('Ошибка: данные переданы неккоректно.'));
  } else {
    User.findByIdAndUpdate(req.user._id, { email: `${email}`, name: `${name}` }, { new: true, runValidators: true, upsert: false })
      .then((user) => res.send({ data: user }))
      .catch(next);
  }
};

module.exports.getCurrentUser = (req, res, next) => {
  User.findById(req.user._id)
    .then((user) => {
      if (!user) {
        throw new NotFoundError('Ошибка: Пользователь с указанным идентификатором не найден');
      }
      res.send({ data: user });
    })
    .catch(next);
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;
  if (!validator.isEmail(email)) {
    return next(new BadRequestError('Ошибка: неккоректный e-mail.'));
  }
  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, NODE_ENV === 'production' ? JWT_SECRET : 'super-dev-secret', { expiresIn: '7d' });
      return res.send({ token });
    })
    .catch((err) => {
      if (err.message === 'Ошибка: Неправильные почта или пароль.') {
        return next(new UnauthorizedError(err.message));
      }
      return next(new BadRequestError(('Ошибка: данные переданы неккоректно.')));
    });
};
