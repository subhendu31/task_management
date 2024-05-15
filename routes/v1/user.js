const express = require('express');
const userController = require('../../Controller/User/userController');
const taskController = require('../../Controller/User/taskController');
const subTaskController = require('../../Controller/User/subTaskController');

const router = express.Router();

router.get('/user-get-profile', userController.userGetProfile);
router.put('/user-profile-update', userController.updateUserProfile);


/// task routes==//
router.post('/add-task', taskController.addTask);
router.post('/update-task/:id', taskController.editTask);
router.get('/get-all-task', taskController.viewTask);
router.put('/delete-task/:id', taskController.deleteTask);


/// sub-task routes==//
router.post('/add-sub-task', subTaskController.addSubTask);
router.post('/update-sub-task/:id', subTaskController.editSubTask);
router.get('/get-all-sub-task', subTaskController.viewSubTask);
router.put('/delete-sub-task/:id', subTaskController.deleteSubTask);
router.get('/get-sub-task-by-taskid/:id', subTaskController.getSubtaskByTaskId);


module.exports = router;
