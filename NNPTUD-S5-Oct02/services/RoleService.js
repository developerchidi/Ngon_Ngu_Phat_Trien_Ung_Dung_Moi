const User = require('../models/User');
const Role = require('../models/Role');
const Database = require('../configs/Database');

class RoleService {
  constructor() {
    this.db = new Database();
    this.userModel = new User(this.db);
    this.roleModel = new Role(this.db);
  }

  createRole(roleData) {
    try {
      const role = this.roleModel.create(roleData);
      return {
        success: true,
        message: 'Tạo role thành công',
        data: role
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  getAllRoles() {
    try {
      const roles = this.roleModel.findAll();
      return {
        success: true,
        data: roles,
        total: roles.length
      };
    } catch (error) {
      return {
        success: false,
        message: 'Lỗi khi lấy danh sách roles',
        error: error.message
      };
    }
  }

  getRoleById(id) {
    try {
      const role = this.roleModel.findById(id);
      
      if (!role) {
        return {
          success: false,
          message: 'Không tìm thấy role với ID này'
        };
      }
      
      return {
        success: true,
        data: role
      };
    } catch (error) {
      return {
        success: false,
        message: 'Lỗi khi lấy role',
        error: error.message
      };
    }
  }

  updateRole(id, updateData) {
    try {
      const role = this.roleModel.update(id, updateData);
      return {
        success: true,
        message: 'Cập nhật role thành công',
        data: role
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  deleteRole(id) {
    try {
      this.roleModel.softDelete(id);
      return {
        success: true,
        message: 'Xóa role thành công'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }
}

module.exports = RoleService;
