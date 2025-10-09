const Database = require('../utils/database');
const bcrypt = require('bcrypt');

class UserModel {
  constructor() {
    this.db = new Database();
  }

  async findById(id) {
    const sql = `
      SELECT u.*, r.name as roleName 
      FROM users u 
      LEFT JOIN roles r ON u.roleId = r.id 
      WHERE u.id = ? AND u.isDeleted = 0
    `;
    return await this.db.get(sql, [id]);
  }

  async findByUsername(username) {
    const sql = `
      SELECT u.*, r.name as roleName 
      FROM users u 
      LEFT JOIN roles r ON u.roleId = r.id 
      WHERE u.username = ? AND u.isDeleted = 0
    `;
    return await this.db.get(sql, [username]);
  }

  async findByEmail(email) {
    const sql = `
      SELECT u.*, r.name as roleName 
      FROM users u 
      LEFT JOIN roles r ON u.roleId = r.id 
      WHERE u.email = ? AND u.isDeleted = 0
    `;
    return await this.db.get(sql, [email]);
  }

  async findAll() {
    const sql = `
      SELECT u.*, r.name as roleName 
      FROM users u 
      LEFT JOIN roles r ON u.roleId = r.id 
      WHERE u.isDeleted = 0
    `;
    return await this.db.all(sql);
  }

  async create(userData) {
    const { username, password, email, fullName, avatarURL, roleId } = userData;
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const sql = `
      INSERT INTO users (username, password, email, fullName, avatarURL, roleId, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
    `;
    
    const result = await this.db.run(sql, [username, hashedPassword, email, fullName || '', avatarURL || '', roleId]);
    return await this.findById(result.id);
  }

  async update(id, updateData) {
    const { username, email, fullName, avatarURL, password, roleId } = updateData;
    
    let sql = 'UPDATE users SET updatedAt = datetime(\'now\')';
    const params = [];
    
    if (username) {
      sql += ', username = ?';
      params.push(username);
    }
    if (email) {
      sql += ', email = ?';
      params.push(email);
    }
    if (fullName !== undefined) {
      sql += ', fullName = ?';
      params.push(fullName);
    }
    if (avatarURL !== undefined) {
      sql += ', avatarURL = ?';
      params.push(avatarURL);
    }
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      sql += ', password = ?';
      params.push(hashedPassword);
    }
    if (roleId) {
      sql += ', roleId = ?';
      params.push(roleId);
    }
    
    sql += ' WHERE id = ? AND isDeleted = 0';
    params.push(id);
    
    await this.db.run(sql, params);
    return await this.findById(id);
  }

  async softDelete(id) {
    const sql = 'UPDATE users SET isDeleted = 1, updatedAt = datetime(\'now\') WHERE id = ?';
    await this.db.run(sql, [id]);
    return true;
  }

  async incrementLoginCount(id) {
    const sql = 'UPDATE users SET loginCount = loginCount + 1, updatedAt = datetime(\'now\') WHERE id = ?';
    await this.db.run(sql, [id]);
    return true;
  }
}

module.exports = UserModel;
