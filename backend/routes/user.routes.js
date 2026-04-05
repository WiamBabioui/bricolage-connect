const express = require('express');
const router  = express.Router();
const auth    = require('../middleware/auth.middleware');
const ctrl    = require('../controllers/user.controller');

router.get('/me',              auth, ctrl.getMe);
router.put('/me',              auth, ctrl.updateMe);
router.put('/me/password',     auth, ctrl.changePassword);   // ✅ nouveau
router.get('/travailleurs',    auth, ctrl.getTravailleurs);
router.get('/:id',             auth, ctrl.getById);

module.exports = router;