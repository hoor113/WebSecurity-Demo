const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/jwtAuth');


router.get('/jwt/verify', verifyToken);

module.exports = router; 