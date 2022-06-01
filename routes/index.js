const router = require('express').Router();

const auth = require('../middlewares/auth');
const NotFoundError = require('../errors/not-found-error');

router.use(require('./signin'));
router.use(require('./signup'));

router.use(auth);

router.use(require('./users'));
router.use(require('./movies'));

router.use('*', (req, res, next) => {
  next(new NotFoundError('Ошибка: данный ресурс не найден.'));
});

module.exports = router;
