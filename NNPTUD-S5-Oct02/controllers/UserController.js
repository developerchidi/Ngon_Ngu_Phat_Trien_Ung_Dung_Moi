const UserService = require('../services/UserService');

class UserController {
  constructor() {
    this.userService = new UserService();
  }

  async createUser(req, res) {
    try {
      const result = await this.userService.createUser(req.body);
      
      if (result.success) {
        res.status(201).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Lỗi khi tạo user',
        error: error.message
      });
    }
  }

  getAllUsers(req, res) {
    try {
      const { username, fullName, includeDeleted } = req.query;
      const filters = { 
        username, 
        fullName, 
        includeDeleted: includeDeleted === 'true' 
      };
      
      const result = this.userService.getAllUsers(filters);
      
      if (result.success) {
        res.json(result);
      } else {
        res.status(500).json(result);
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Lỗi khi lấy danh sách users',
        error: error.message
      });
    }
  }

  getUserById(req, res) {
    try {
      const { id } = req.params;
      const result = this.userService.getUserById(id);
      
      if (result.success) {
        res.json(result);
      } else {
        res.status(404).json(result);
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Lỗi khi lấy user',
        error: error.message
      });
    }
  }

  getUserByUsername(req, res) {
    try {
      const { username } = req.params;
      const result = this.userService.getUserByUsername(username);
      
      if (result.success) {
        res.json(result);
      } else {
        res.status(404).json(result);
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Lỗi khi lấy user',
        error: error.message
      });
    }
  }

  async updateUser(req, res) {
    try {
      const { id } = req.params;
      const result = await this.userService.updateUser(id, req.body);
      
      if (result.success) {
        res.json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Lỗi khi cập nhật user',
        error: error.message
      });
    }
  }

  deleteUser(req, res) {
    try {
      const { id } = req.params;
      const result = this.userService.deleteUser(id);
      
      if (result.success) {
        res.json(result);
      } else {
        res.status(404).json(result);
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Lỗi khi xóa user',
        error: error.message
      });
    }
  }

  async authenticateUser(req, res) {
    try {
      const { email, username } = req.body;
      
      if (!email || !username) {
        return res.status(400).json({
          success: false,
          message: 'Email và username là bắt buộc'
        });
      }
      
      const result = await this.userService.authenticateUser(email, username);
      
      if (result.success) {
        res.json(result);
      } else {
        res.status(401).json(result);
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Lỗi khi xác thực',
        error: error.message
      });
    }
  }
}

module.exports = UserController;
