const express = require('express');
const router = express.Router();
const upload = require('../config/multer');
const registrationController = require('../controllers/registrationController');

// Robust multer configuration accepting proof uploads without throwing Unexpected field
router.post('/', upload.any(), registrationController.createRegistration);
router.get('/', registrationController.getRegistrations);
router.get('/stats', registrationController.getStats);
router.get('/:id', registrationController.getRegistrationById);
router.delete('/:id', registrationController.deleteRegistration);

module.exports = router;
