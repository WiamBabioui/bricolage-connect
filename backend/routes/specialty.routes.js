const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/specialty.controller');

router.get('/', ctrl.getAll);

module.exports = router;