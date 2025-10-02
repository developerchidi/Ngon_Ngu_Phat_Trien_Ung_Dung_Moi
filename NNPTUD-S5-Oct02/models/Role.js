class Role {
  constructor(database) {
    this.db = database;
  }

  create(roleData) {
    const { name, description = '' } = roleData;
    
    // Validation
    if (!name || name.trim() === '') {
      throw new Error('Tên role là bắt buộc');
    }
    
    // Check if role name already exists
    const existingRole = this.findByName(name.trim());
    if (existingRole) {
      throw new Error('Tên role đã tồn tại');
    }
    
    const newRole = {
      id: this.db.getNextId('roles'),
      name: name.trim(),
      description: description.trim(),
      isDelete: false,
      createdAt: this.db.generateTimestamp(),
      updatedAt: this.db.generateTimestamp()
    };
    
    const roles = this.db.getCollection('roles');
    roles.push(newRole);
    this.db.setCollection('roles', roles);
    
    return newRole;
  }

  findAll() {
    return this.db.getCollection('roles').filter(role => !role.isDelete);
  }

  findById(id) {
    return this.db.getCollection('roles').find(r => r.id === parseInt(id) && !r.isDelete);
  }

  findByName(name) {
    return this.db.getCollection('roles').find(r => r.name === name.trim() && !r.isDelete);
  }

  update(id, updateData) {
    const roles = this.db.getCollection('roles');
    const roleIndex = roles.findIndex(r => r.id === parseInt(id) && !r.isDelete);
    
    if (roleIndex === -1) {
      throw new Error('Không tìm thấy role với ID này');
    }
    
    const { name, description } = updateData;
    
    // Check if new name already exists (excluding current role)
    if (name && name.trim() !== '') {
      const existingRole = roles.find(r => r.name === name.trim() && r.id !== parseInt(id) && !r.isDelete);
      if (existingRole) {
        throw new Error('Tên role đã tồn tại');
      }
    }
    
    // Update role
    if (name) roles[roleIndex].name = name.trim();
    if (description !== undefined) roles[roleIndex].description = description.trim();
    roles[roleIndex].updatedAt = this.db.generateTimestamp();
    
    this.db.setCollection('roles', roles);
    return roles[roleIndex];
  }

  softDelete(id) {
    const roles = this.db.getCollection('roles');
    const roleIndex = roles.findIndex(r => r.id === parseInt(id) && !r.isDelete);
    
    if (roleIndex === -1) {
      throw new Error('Không tìm thấy role với ID này');
    }
    
    // Check if role is being used by any user
    const users = this.db.getCollection('users');
    const usersWithRole = users.filter(u => u.role === parseInt(id) && !u.isDelete);
    if (usersWithRole.length > 0) {
      throw new Error('Không thể xóa role đang được sử dụng bởi user');
    }
    
    roles[roleIndex].isDelete = true;
    roles[roleIndex].updatedAt = this.db.generateTimestamp();
    
    this.db.setCollection('roles', roles);
    return true;
  }
}

module.exports = Role;
