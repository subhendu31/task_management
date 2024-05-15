const express = require('express');
const authController = require('../../Controller/Auth/authController');
const userRoute = require('./user')
const middleware = require("../../middleware/authJwt").middleware;


const router = express.Router();


router.post('/user-registration', authController.userRegistration);
router.post('/login', authController.login);

router.use(middleware)
router.use('/', userRoute)


module.exports = router;
