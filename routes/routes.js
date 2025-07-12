//ovdje uvozimo kontrolere za svaku tablicu posebno - u kontrolerima su funkcije za svaku tablicu posebno
//za pregled, dodavanje, brisanje i uređivanje

const userController = require('../controllers/userController.js')

const router = require('express').Router()


//Table User
router.post('/addUser', userController.addUser);
router.post('/getAllUsers', userController.getAllUsers);
router.post('/getOneUser/:ID_user', userController.getOneUser);
router.post('/updateUser/:ID_user', userController.updateUser);
router.post('/deleteUser/:ID_user', userController.deleteUser);