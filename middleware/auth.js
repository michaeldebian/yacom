exports.requireLogin = (req, res, next) => {
  if (!req.user) {
    return res.redirect('/login');
  }

  next();
};

exports.requireAdmin = (req, res, next) => {
  if (!req.user.admin) {
    return res.status(404).render('errors/404.jade')
  }

  next();
};

