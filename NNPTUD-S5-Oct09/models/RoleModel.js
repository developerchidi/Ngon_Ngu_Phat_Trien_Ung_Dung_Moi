const Database = require('../utils/database');

class RoleModel {
  constructor() {
    this.db = new Database();
  }

  async findById(id) {
    const sql = 'SELECT * FROM roles WHERE id = ? AND isDeleted = 0';
    return await this.db.get(sql, [id]);
  }

  async findByName(name) {
    const sql = 'SELECT * FROM roles WHERE name = ? AND isDeleted = 0';
    return await this.db.get(sql, [name]);
  }

  async findAll() {
    const sql = 'SELECT * FROM roles WHERE isDeleted = 0';
    return await this.db.all(sql);
  }

  async create(roleData) {
    const { name, description } = roleData;
    
    const sql = `
      INSERT INTO roles (name, description, updatedAt)
      VALUES (?, ?, datetime('now'))
    `;
    
    const result = await this.db.run(sql, [name, description || '']);
    return await this.findById(result.id);
  }

  async update(id, updateData) {
    const { name, description } = updateData;
    
    let sql = 'UPDATE roles SET updatedAt = datetime(\'now\')';
    const params = [];
    
    if (name) {
      sql += ', name = ?';
      params.push(name);
    }
    if (description !== undefined) {
      sql += ', description = ?';
      params.push(description);
    }
    
    sql += ' WHERE id = ? AND isDeleted = 0';
    params.push(id);
    
    await this.db.run(sql, params);
    return await this.findById(id);
  }

  async softDelete(id) {
    const sql = 'UPDATE roles SET isDeleted = 1, updatedAt = datetime(\'now\') WHERE id = ?';
    await this.db.run(sql, [id]);
    return true;
  }
}

module.exports = RoleModel;
