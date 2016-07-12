const express = require('express');
const config = require('../../config').databases;
const cassandra = require('cassandra-driver');
const SshClient = require('node-ssh');

const client = new cassandra.Client({
  contactPoints: config.development.hosts,
  authProvider: new cassandra.auth.PlainTextAuthProvider(
    config.development.cassandra.username,
    config.development.cassandra.password
  ),
});

client.connect(function(err, result) {
  if (err) {
    console.log('Cassandra connection error:' + err);
  } else {
    console.log('Connected to cassandra server');
  }
});

function execute(code, qClient) {
  if (!code) {
    return Promise.resolve();
  }

  qClient = qClient || client;

  return new Promise((resolve, reject) => {
    console.log('[CASSANDRA]', code);
    qClient.execute(code, (err) => {
      if (err) {
        reject(err);
      }

      resolve();
    });
  });
}

var router = express.Router();
module.exports = router;

router.get('/', (req, res) => res.render('databases/cassandra.jade'));

router.post('/keyspaces', (req, res, next) => {
  var queries = [];

  queries.push(`CREATE KEYSPACE IF NOT EXISTS "${req.body.name}" WITH replication = {'class': 'SimpleStrategy', 'replication_factor': 3}`);

  if (req.body.users) {
    req.body.users.forEach((user) => {
      if (!user.name) {
        return;
      };

      if (user.password) {
        queries.push(createUser(user));
      }

      queries.push(assignUserToKeyspace(user.name, req.body.name));
    });
  }

  runQuery(res, queries, 0, next);
});

router.put('/cql', (req, res, next) => {
  if (!req.body.cql || !req.body.username || !req.body.password) {
    return res.status(400).end();
  }

  var client = new cassandra.Client({
    contactPoints: config.development.hosts,
    authProvider: new cassandra.auth.PlainTextAuthProvider(
      req.body.username,
      req.body.password
    ),
  });

  client.connect(err => {
    if (err) {
      return next(err);
    }

    runQuery(res, req.body.cql.split(';'), 0, next, client);
  });

});

var changeOrder = ['development', 'qa', 'production'];

router.post('/promote', (req, res, next) => {
  if (!req.body.keyspace || (req.body.currentEnv !== 'development' && req.body.currentEnv !== 'qa')) {
    return res.status(400).end();
  }

  var currentEnv = config[req.body.currentEnv];
  var toEnv = config[changeOrder[changeOrder.indexOf(req.body.currentEnv) + 1]];

  var currentSsh = new SshClient();
  var envSsh;
  var schemaStr;

  currentSsh.connect({
    host: randomItem(currentEnv.hosts),
    username: currentEnv.ssh.username,
    privateKey: currentEnv.ssh.privateKey || `${process.env.HOME}/.ssh/id_rsa`
  }).then(() => {
    return currentSsh.execCommand(`cqlsh -u ${currentEnv.cassandra.username} \
                                     -p ${currentEnv.cassandra.password} \
                                     -e "DESCRIBE KEYSPACE ${req.body.keyspace}"`)
  }).then(result => {
    if (result.code !== 0) {
      throw new Error(result.stderr);
    }

    currentSsh.end();
    schemaStr = result.stdout;

    envSsh = new SshClient();

    return envSsh.connect({
      host: randomItem(toEnv.hosts),
      username: toEnv.ssh.username,
      privateKey: toEnv.ssh.privateKey || `${process.env.HOME}/.ssh/id_rsa`
    });
  }).then(() => {
    return envSsh.execCommand(`cqlsh -u ${toEnv.cassandra.username} \
                                     -p ${toEnv.cassandra.password} \
                                     -e "${schemaStr}"`);
  }).then(result => {
    if (result.code !== 0) {
      throw new Error(result.stderr);
    }

    res.end();
  }).catch(next);
});

router.post('/keyspaces/users', (req, res, next) => {
  if (!req.body.username || !req.body.keyspace)  {
    return res.status(400).end();
  }

  execute(assignUserToKeyspace(req.body.username, req.body.keyspace))
    .then(() => res.end())
    .catch(next);
});

router.post('/users', (req, res, next) => {
  if (!req.body.name || !req.body.password)  {
    return res.status(400).end();
  }

  execute(createUser(req.body))
    .then(() => res.end())
    .catch(next);
});

router.use((err, req, res, next) => {
  console.log(err);
  res.status(500).json({ info: err.info, message: err.message });
});

function createUser(user) {
  return `CREATE USER IF NOT EXISTS ${user.name} WITH PASSWORD '${user.password}' NOSUPERUSER`;
}

function assignUserToKeyspace(user, keyspace) {
  return `GRANT ALL ON KEYSPACE ${keyspace} TO ${user}`;
}

function runQuery(res, queries, index, next, qClient) {
  qClient = qClient || client;

  execute(queries[index], qClient).then(() => {
    if (index + 1 === queries.length) {
      return res.end();
    }

    runQuery(res, queries, index + 1, next, qClient);
  }).catch(next);
}

function randomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}
