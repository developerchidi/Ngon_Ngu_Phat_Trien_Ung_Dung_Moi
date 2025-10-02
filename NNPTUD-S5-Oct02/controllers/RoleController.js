const RoleService = require('../services/RoleService');

class RoleController {
  constructor() {
    this.roleService = new RoleService();
  }

  createRole(req, res) {
    try {
      const result = this.roleService.createRole(req.body);
      
      if (result.success) {
        res.status(201).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Lỗi khi tạo role',
        error: error.message
      });
    }
  }

  getAllRoles(req, res) {
    try {
      const result = this.roleService.getAllRoles();
      
      if (result.success) {
        res.json(result);
      } else {
        res.status(500).json(result);
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Lỗi khi lấy danh sách roles',
        error: error.message
      });
    }
  }

  getRoleById(req, res) {
    try {
      const { id } = req.params;
      const result = this.roleService.getRoleById(id);
      
      if (result.success) {
        res.json(result);
      } else {
        res.status(404).json(result);
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Lỗi khi lấy role',
        error: error.message
      });
    }
  }

  updateRole(req, res) {
    try {
      const { id } = req.params;
      const result = this.roleService.updateRole(id, req.body);
      
      if (result.success) {
        res.json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Lỗi khi cập nhật role',
        error: error.message
      });
    }
  }

  deleteRole(req, res) {
    try {
      const { id } = req.params;
      const result = this.roleService.deleteRole(id);
      
      if (result.success) {
        res.json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Lỗi khi xóa role',
        error: error.message
      });
    }
  }
}

module.exports = RoleController;
