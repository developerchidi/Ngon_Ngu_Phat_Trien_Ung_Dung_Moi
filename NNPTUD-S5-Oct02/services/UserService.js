const User = require('../models/User');
const Role = require('../models/Role');
const Database = require('../configs/Database');

class UserService {
  constructor() {
    this.db = new Database();
    this.userModel = new User(this.db);
    this.roleModel = new Role(this.db);
  }

  async createUser(userData) {
    try {
      const user = await this.userModel.create(userData);
      const { password, ...userResponse } = user;
      return {
        success: true,
        message: 'Tạo user thành công',
        data: userResponse
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  getAllUsers(filters = {}) {
    try {
      const users = this.userModel.findAll(filters);
      
      // Populate role information
      const usersWithRoles = users.map(user => {
        const role = this.roleModel.findById(user.role);
        const { password, ...userResponse } = user;
        return {
          ...userResponse,
          roleInfo: role ? { id: role.id, name: role.name, description: role.description } : null
        };
      });
      
      return {
        success: true,
        data: usersWithRoles,
        total: usersWithRoles.length
      };
    } catch (error) {
      return {
        success: false,
        message: 'Lỗi khi lấy danh sách users',
        error: error.message
      };
    }
  }

  getUserById(id) {
    try {
      const user = this.userModel.findById(id);
      
      if (!user) {
        return {
          success: false,
          message: 'Không tìm thấy user với ID này'
        };
      }
      
      // Get role information
      const role = this.roleModel.findById(user.role);
      const { password, ...userResponse } = user;
      
      return {
        success: true,
        data: {
          ...userResponse,
          roleInfo: role ? { id: role.id, name: role.name, description: role.description } : null
        }
      };
    } catch (error) {
      return {
        success: false,
        message: 'Lỗi khi lấy user',
        error: error.message
      };
    }
  }

  getUserByUsername(username) {
    try {
      const user = this.userModel.findByUsername(username);
      
      if (!user) {
        return {
          success: false,
          message: 'Không tìm thấy user với username này'
        };
      }
      
      // Get role information
      const role = this.roleModel.findById(user.role);
      const { password, ...userResponse } = user;
      
      return {
        success: true,
        data: {
          ...userResponse,
          roleInfo: role ? { id: role.id, name: role.name, description: role.description } : null
        }
      };
    } catch (error) {
      return {
        success: false,
        message: 'Lỗi khi lấy user',
        error: error.message
      };
    }
  }

  async updateUser(id, updateData) {
    try {
      const user = await this.userModel.update(id, updateData);
      const { password, ...userResponse } = user;
      
      return {
        success: true,
        message: 'Cập nhật user thành công',
        data: userResponse
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  deleteUser(id) {
    try {
      this.userModel.softDelete(id);
      return {
        success: true,
        message: 'Xóa user thành công'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  async authenticateUser(email, username) {
    try {
      const user = await this.userModel.authenticate(email, username);
      
      // Get role information
      const role = this.roleModel.findById(user.role);
      const { password, ...userResponse } = user;
      
      return {
        success: true,
        message: 'Đăng nhập thành công',
        data: {
          ...userResponse,
          roleInfo: role ? { id: role.id, name: role.name, description: role.description } : null
        }
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }
}

module.exports = UserService;
