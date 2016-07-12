const express = require('express');
const models = require('../models');
const auth = require('../middleware/auth');

const TAXONOMIES_MODELS = {
  apps: models.appTaxonomy,
  environments: models.environmentTaxonomy,
  locations: models.locationTaxonomy,
  groups: models.serverGroup
};

const TAXONOMIES_TITLES = {
  apps: 'Apps',
  environments: 'Environments',
  locations: 'Locations',
  groups: 'Groups'
};

var router = express.Router();

router.use(auth.requireLogin);
router.use(auth.requireAdmin);

function findModel(req, res, next) {
  res.locals.type = req.params.type;

  if (res.locals.type in TAXONOMIES_MODELS) {
    res.locals.model = TAXONOMIES_MODELS[res.locals.type];
    return next();
  }

  res.status(404).end();
}

router.get('/:type', findModel, (req, res, next) => {
  res.locals.model.findAll().then(taxonomies => {
    res.format({
      html: () => res.render('taxonomies/taxonomies', {
        items: taxonomies,
        title: TAXONOMIES_TITLES[req.params.type]
      }),
      json: () => res.json(taxonomies)
    });
  }).catch(next);
});

router.post('/:type', findModel, (req, res, next) => {
  res.locals.model.create(req.body.taxonomy).then(taxonomy => {
    res.status(201).json(taxonomy);
  }).catch(next);
});

router.put('/:type/:id', findModel, (req, res, next) => {
  res.locals.model.update(req.body.taxonomy, { where: {id: req.params.id} }).then(taxonomy => {
    res.json(taxonomy);
  }).catch(next);
});

router.delete('/:type/:id', findModel, (req, res, next) => {
  res.locals.model.destroy({ where: {id: req.params.id} }).then(() => {
    res.status(204).end();
  }).catch(next);
});

module.exports = router;
