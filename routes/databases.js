const express = require('express');

var router = express.Router();
module.exports = router;

router.use('/cassandra', require('./databases/cassandra'));
