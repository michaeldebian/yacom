/**
 * @swagger
 * resourcePath: /servers
 * description: Servers API
 */

const express = require('express');
const uuid = require('uuid');
const path = require('path');
const fs = require('fs');
const mkdirp = require('mkdirp');
const moment = require('moment');
const renderScript = require('../shared/script-gen.js');
const auth = require('../middleware/auth');

const models = require('../models');
const Server = models.server;
const Execution = models.execution;
const ServerGroup = models.serverGroup;
const AppTaxonomy = models.appTaxonomy;
const LocationTaxonomy = models.locationTaxonomy;
const EnvironmentTaxonomy = models.environmentTaxonomy;

const PUBLIC_SERVER_ATTRIBUTES = [
  'id',
  'osVersion',
  'ipAddress',
  'email',
  'locationId',
  'groupId',
  'appId',
  'environmentId',
  'serverName',
  'osPackages',
  'deployerUser',
  'developerPackages',
  'deploymentPath',
  'gitUrl',
  'pubKey'
];

const LIST_SERVER_ATTRIBUTES = [
  'id',
  'ipAddress',
  'serverName',
  'currentExecutionId',
  'groupId',
  'appId',
  'environmentId',
  'locationId'
];

const LIST_TAXONOMY_ATTRIBUTES = ['name'];

const CHECK_IP_ATTRIBUTES = ['id', 'ipAddress'];

const TAXONOMY_ATTRIBUTES = { attributes: ['id', 'name'] };

const TAXONOMY_TYPES = [
  {name: 'locationId', title: 'Location'},
  {name: 'environmentId', title: 'Environment'},
  {name: 'appId', title: 'App'},
  {name: 'groupId', title: 'Group'}
];

function findTaxonomies(req, res, next) {
  Promise.all([
      models.appTaxonomy.findAll(TAXONOMY_ATTRIBUTES),
      models.locationTaxonomy.findAll(TAXONOMY_ATTRIBUTES),
      models.environmentTaxonomy.findAll(TAXONOMY_ATTRIBUTES),
      models.serverGroup.findAll(TAXONOMY_ATTRIBUTES)
  ]).then(function(values) {
    res.locals.taxonomies = {
      appId: values[0],
      locationId: values[1],
      environmentId: values[2],
      groupId: values[3]
    };

    res.locals.taxonomyTypes = TAXONOMY_TYPES;
    next();
  }).catch(next);
}

var router = express.Router();

router.get('/', auth.requireLogin, auth.requireAdmin, (req, res, next) => {
  Server.findAll({
    attributes: LIST_SERVER_ATTRIBUTES,
    include: [
      { model: Execution, as: 'currentExecution' },
      { model: ServerGroup, as: 'group', attributes: LIST_TAXONOMY_ATTRIBUTES},
      { model: AppTaxonomy, as: 'app', attributes: LIST_TAXONOMY_ATTRIBUTES},
      { model: LocationTaxonomy, as: 'location', attributes: LIST_TAXONOMY_ATTRIBUTES},
      { model: EnvironmentTaxonomy, as: 'environment', attributes: LIST_TAXONOMY_ATTRIBUTES},
    ]
  }).then((servers) => {
    res.render('servers/index', {servers: servers});
  }).catch(next);
});

router.get('/new', auth.requireLogin, auth.requireAdmin, findTaxonomies, (req, res) => {
  res.render('servers/item');
});


router.post('/', auth.requireLogin, auth.requireAdmin, (req, res, next) => {
  Server.create(req.body.server, { attributes: PUBLIC_SERVER_ATTRIBUTES })
    .then(server => {
      res.format({
        json: () => res.json(server)
      });
    }).catch(next);
});

router.get('/:id', auth.requireLogin, auth.requireAdmin, findTaxonomies, (req, res, next) => {
  Server.findById(req.params.id, { attributes: PUBLIC_SERVER_ATTRIBUTES })
    .then(server => {
      if (server) {
        res.format({
          html: () => res.render('servers/item', {server: server}),
          json: () => res.json(server)
        });
      } else {
        res.status(404).end('Not found');
      }
    }).catch(next);
});

router.get('/:id/execution', auth.requireLogin, auth.requireAdmin, (req, res, next) => {
  Server.findById(req.params.id, {
    attributes: ['id', 'serverName'],
    include: [
      { model: Execution, as: 'currentExecution' }
    ]
  }).then(server => {
    if (server) {
      res.render('servers/execution', {server: server});
    } else {
      res.status(404).end('Not found');
    }
  }).catch(next);
});

router.get('/:id/execution/log', auth.requireLogin, auth.requireAdmin, (req, res, next) => {
  Server.findById(req.params.id, {
    attributes: ['id', 'serverName'],
    include: [
      { model: Execution, as: 'currentExecution', attributes: ['log', 'createdAt'] }
    ]
  }).then(server => {
    if (server) {
      var timestamp = moment(server.currentExecution.createdAt).format('YYYYMMDDhhmmss');
      res.attachment(`${timestamp}-${server.serverName}.log`);
      res.send(server.currentExecution.log);
    } else {
      res.status(404).end('Not found');
    }
  }).catch(next);
});

router.put('/:id', auth.requireLogin, auth.requireAdmin, (req, res, next) => {
  for (var taxonomy of TAXONOMY_TYPES) {
    var value = req.body.server[taxonomy.name];
    req.body.server[taxonomy.name] = value === '' ? null : value;
  }

  Server.update(req.body.server, {
    where: { id: req.params.id },
    individualHooks: true,
    attributes: PUBLIC_SERVER_ATTRIBUTES
  })
  .then(server => {
    if (server) {
      res.format({
        json: () => res.json(server)
      });
    } else {
      res.status(404).end('Not found');
    }
  })
  .catch(next);
});

router.delete('/:id', auth.requireLogin, auth.requireAdmin, (req, res, next) => {
  Server.destroy({ where: {id: req.params.id} }).then(() => {
    res.redirect('/servers');
  }).catch(next);
});


/**
 * @swagger
 * path: /servers/{serverId}/ssh-key
 * operations:
 *   -  httpMethod: GET
 *      summary: Returns server's ssh private key
 *      notes: The server query is based on client's IP, {serverId} is actually ignored.
 *      responseMessages:
 *        - code: 200
 *          message: "Server's RSA Private key"
 *        - code: 404
 *          message: "Server not found. Wrong IP Address"
 */
router.get('/*/ssh-key', findServer({
  attributes: ['id', 'sshKey']
}), (req, res) => {
  res.send(req.server.sshKey);
});


/**
 * @swagger
 * path: /servers/{serverId}/sh
 * operations:
 *   -  httpMethod: GET
 *      summary: Return server's last script
 *      notes: The servers query is based on client's IP, {serverId} is actually ignored.
 *      responseMessages:
 *        - code: 200
 *          message: "Servers's last script"
 *        - code: 404
 *          message: "Server not found. Wrong IP Address"
 */
router.get('/*/sh', findServer(null, true), (req, res) => {
  res.download(req.server.getScriptPath());
});

/**
 * @swagger
 * models:
 *   Execution:
 *     id: Execution
 *     properties:
 *       id:
 *         type: integer
 *         required: true
 *       exitCode:
 *         type: integer
 *       stage:
 *         type: string
 *       log:
 *         type: string
 *       serverId:
 *         type: integer
 *         required: true
 */

/**
 * @swagger
 * path: /servers/{serverId}/executions
 * operations:
 *   -  httpMethod: POST
 *      summary: Creates a new server script's execution and sets it as the current one.
 *      notes: The server query is based on client's IP, {serverId} is actually ignored.
 *      responseMessages:
 *        - code: 200
 *          responseModel: 'Execution'
 *        - code: 404
 *          message: "Server not found. Wrong IP Address"
 */
router.post('/*/executions', findServer(), (req, res, next) => {
  Execution.create({ serverId: req.params.id })
    .then(execution => {
      req.server.currentExecutionId = execution.id;

      req.server.save().then(server => {
        res.format({
          json: () => res.json(execution)
        });
      }).catch(next);
    })
  .catch(next);
});

/**
 * @swagger
 * path: /servers/{serverId}/execution
 * operations:
 *   -  httpMethod: PUT
 *      summary: Updates current server execution
 *      notes: The server query is based on client's IP, {serverId} is actually ignored.
 *      responseMessages:
 *        - code: 200
 *          responseModel: 'Execution'
 *        - code: 404
 *          message: "Server not found. Wrong IP Address"
 *      parameters:
 *        - name: stage
 *          dataType: string
 *        - name: log
 *          dataType: string
 *        - name: exitCode
 *          dataType: integer
 */
router.put('/*/execution', findServer({
  include: [{ model: Execution, as: 'currentExecution' }]
}), (req, res, next) => {
  req.server.currentExecution.update(req.body).then(execution => {
    if (execution) {
      res.format({
        json: () => res.json(execution)
      });
    } else {
      res.status(404).end({error: 'Not found'});
    }
  })
  .catch(next);
});

function findServer(config, asScript) {
  config = config || {};
  config.where = config.where || {};

  return (req, res, next) => {
    config.where.ipAddress = req.headers['x-forwarded-for'] || req.ip;

    Server.findOne(config)
      .then(server => {
        if (server) {
          req.server = server;
          next();
        } else {
          res.status(404);
          var msg = 'Server not found. Wrong IP Address.';

          if (asScript) {
            msg = `echo "[YACOM] ${msg}"; exit 403`;
          }

          res.send(msg);
        }
      })
    .catch(next);
  };
}

module.exports = router;
