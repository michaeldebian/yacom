const express = require('express');
const User = require('../models').user;
const auth = require('../middleware/auth');

const LIST_USER_ATTRS = ['id', 'name', 'surname', 'email', 'admin'];
const PUBLIC_USER_ATTRS = LIST_USER_ATTRS;

var router = express.Router();

router.use(auth.requireLogin);
router.use(auth.requireAdmin);

module.exports = router;

router.get('/', (req, res, next) => {
  User.findAll({
    attributes: LIST_USER_ATTRS
  }).then((users) => {
    res.render('users/index', {users: users});
  }).catch(next);
});

router.get('/new', (req, res) => {
  res.render('users/item');
});

router.post('/', (req, res, next) => {
  User.create(req.body.user, {
    attributes: PUBLIC_USER_ATTRS
  }).then(user => {
    res.format({
      html: () => res.redirect('/users'),
      json: () => res.json(user)
    });
  }).catch(next);
});

router.get('/:id', (req, res, next) => {
  User.findById(req.params.id, {
    attributes: PUBLIC_USER_ATTRS
  }).then(user => {
    if (user) {
      res.format({
        html: () => res.render('users/item', {user: user}),
        json: () => res.json(user)
      });
    } else {
      res.status(404).end('Not found');
    }
  }).catch(next);
});

router.put('/:id', (req, res, next) => {
  var reqUser = req.body.user;
  reqUser.admin = !!reqUser.admin;

  User.update(reqUser, {
    where: { id: req.params.id },
    attributes: PUBLIC_USER_ATTRS,
    individualHooks: true
  }).then(user => {
    if (user) {
      res.format({
        html: () => res.redirect('/users'),
        json: () => res.json(user)
      });
    } else {
      res.status(404).end('Not found');
    }
  }).catch(next);
});

router.delete('/:id', (req, res, next) => {
  User.destroy({ where: {id: req.params.id}}).then(() => {
    res.redirect('/users');
  }).catch(next);
});
