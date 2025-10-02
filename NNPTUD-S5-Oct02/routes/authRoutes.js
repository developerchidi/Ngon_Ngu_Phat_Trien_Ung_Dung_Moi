const express = require('express');
const UserController = require('../controllers/UserController');

const router = express.Router();
const userController = new UserController();

// Authentication routes
router.post('/login', userController.authenticateUser.bind(userController));

module.exports = router;
