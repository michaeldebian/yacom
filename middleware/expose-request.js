module.exports = function exposeCurrentUser(req, res, next) {
  res.locals.currentUser = req.user;
  next();
};
