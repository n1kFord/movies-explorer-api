const Movie = require('../models/movie');
const NotFoundError = require('../errors/not-found-error');
const BadRequestError = require('../errors/bad-request-error');
const ForbiddenError = require('../errors/forbidden-error');
const ConflictError = require('../errors/conflict-error');

module.exports.getMovies = (req, res, next) => {
  Movie.find({})
    .then((movies) => res.send({ data: movies }))
    .catch(next);
};

module.exports.createMovie = (req, res, next) => {
  const {
    country, director, duration,
    year, description, image, trailerLink,
    nameRU, nameEN, thumbnail, movieId,
  } = req.body;
  if (!country || !director || !duration
    || !year || !description || !image || !trailerLink
    || !nameRU || !nameEN || !thumbnail || !movieId) {
    next(new BadRequestError('Ошибка: данные переданы неккоректно.'));
  } else {
    Movie.create({
      country,
      director,
      duration,
      year,
      description,
      image,
      trailerLink,
      nameRU,
      nameEN,
      thumbnail,
      movieId,
      owner: req.user._id,
    })
      .then((movie) => res.send({ data: movie }))
      .catch((err) => {
        console.log(err);
        if (err.code === 11000) {
          next(new ConflictError('Ошибка: фильм с таким id уже существует.'));
        } else if (err.name === 'ValidationError') {
          next(new Error(`Ошибка валидации: ${err.message}`));
        } else {
          next(err);
        }
      });
  }
};

module.exports.deleteMovieById = (req, res, next) => {
  Movie.findById(req.params._id)
    .then((movieInfo) => {
      if (movieInfo === null) {
        throw new NotFoundError('Ошибка: Фильм с указанным идентификатором не найден');
      } else if (movieInfo.owner.toString() === req.user._id) {
        Movie.findByIdAndRemove(req.params._id)
          .then((data) => {
            res.send({ data });
          })
          .catch(next);
      } else {
        throw new ForbiddenError('Ошибка: вы не можете удалить чужой фильм.');
      }
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BadRequestError(('Ошибка: id является неккоректным.')));
      } else {
        next(err);
      }
    });
};
