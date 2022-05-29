const router = require('express').Router();
const {
  celebrate, Joi,
} = require('celebrate');
const { linkRegexp } = require('../utils/regexp');

const {
  getMovies, createMovie, deleteMovieById,
} = require('../controllers/movies');

router.get('/movies', getMovies);
router.post('/movies', celebrate({
  body: Joi.object().keys({
    country: Joi.string().required(),
    director: Joi.string().required(),
    duration: Joi.number().required(),
    year: Joi.string().required(),
    description: Joi.string().required(),
    image: Joi.string().regex(linkRegexp).required(),
    trailerLink: Joi.string().regex(linkRegexp).required(),
    thumbnail: Joi.string().regex(linkRegexp).required(),
    movieId: Joi.number().required(),
    nameRU: Joi.string().required(),
    nameEN: Joi.string().required(),
  }),
}), createMovie);
router.delete('/movies/:_id', celebrate({
  params: Joi.object().keys({
    _id: Joi.string().hex().length(24),
  }),
}), deleteMovieById);

module.exports = router;
