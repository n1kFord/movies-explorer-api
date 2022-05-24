const router = require('express').Router();
const {
  celebrate, Joi,
} = require('celebrate');

const {
  changeUserInfo, getCurrentUser,
} = require('../controllers/users');

router.get('/me', getCurrentUser);
router.patch('/me', celebrate({
  body: Joi.object().keys({
    email: Joi.string().email().required(),
    name: Joi.string().min(2).max(30).required(),
  }),
}), changeUserInfo);

module.exports = router;
