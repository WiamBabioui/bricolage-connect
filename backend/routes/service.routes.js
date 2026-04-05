const express = require('express');
const router  = express.Router();
const auth    = require('../middleware/auth.middleware');
const ctrl    = require('../controllers/service.controller');

router.get('/',              auth, ctrl.getAll);
router.post('/',             auth, ctrl.create);
router.get('/me',            auth, ctrl.getMine);
router.get('/earnings',      auth, ctrl.getMyEarnings);   // ✅ gains du mois
router.put('/:id/accept',    auth, ctrl.accept);
router.put('/:id/done',      auth, ctrl.complete);

module.exports = router;
