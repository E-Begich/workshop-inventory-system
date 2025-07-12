//ovdje uvozimo kontrolere za svaku tablicu posebno - u kontrolerima su funkcije za svaku tablicu posebno
//za pregled, dodavanje, brisanje i uređivanje

const userController = require('../controllers/userController.js')

const router = require('express').Router()


//Table User
router.post('/addUser', userController.addUser);
router.get('/getAllUsers', userController.getAllUsers);
router.get('/getOneUser/:ID_user', userController.getOneUser);
router.put('/updateUser/:ID_user', userController.updateUser);
router.delete('/deleteUser/:ID_user', userController.deleteUser);

module.exports = router;