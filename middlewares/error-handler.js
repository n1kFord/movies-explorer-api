module.exports = (err, req, res, next) => {
  console.log(err.name, err.message);
  const { statusCode = 500, message } = err;
  res.status(statusCode).send({ message: statusCode === 500 ? 'Ошибка: что-то пошло не так.' : message });
  next();
};
