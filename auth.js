const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const User = require('./models').user;

passport.use('local-login', new LocalStrategy((email, password, done) => {
  User.findOne({ where: {email: email} }).then(user => {
    if (user) {
      user.verifyPassword(password).then(valid => {
        done(null, valid && user);
      }).catch(done);
    } else {
      done(null, false);
    }
  }).catch(done);
}));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id).then(user => done(null, user)).catch(done);
});
