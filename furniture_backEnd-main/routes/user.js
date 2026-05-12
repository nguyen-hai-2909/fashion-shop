const express = require('express');
const router = express.Router();
const {requireAuth} =require('../middleware/authMiddleware')

const {getAllUsers,createUser,getSingleUser,updateUser,deleteUser,loginUser,
        sendMailUser,resetPassword, editUser, changePassword, getProfileUser} = require('../controllers/user')

router.route('/').get(getAllUsers).post(createUser);
router.route('/:id').get(getSingleUser).patch(updateUser).delete(deleteUser);
router.route('/login').post(loginUser);
router.route('/send-mail').post(sendMailUser);
router.route('/reset-password').put(requireAuth,resetPassword)
router.route('/edit').put(requireAuth, editUser)
router.route('/change-password').put(requireAuth, changePassword);
router.route('/profile/me').get(requireAuth, getProfileUser)

module.exports = router;