const express = require('express');
const RoleController = require('../controllers/RoleController');

const router = express.Router();
const roleController = new RoleController();

// Role routes
router.get('/', roleController.getAllRoles.bind(roleController));
router.get('/:id', roleController.getRoleById.bind(roleController));
router.post('/', roleController.createRole.bind(roleController));
router.put('/:id', roleController.updateRole.bind(roleController));
router.delete('/:id', roleController.deleteRole.bind(roleController));

module.exports = router;
