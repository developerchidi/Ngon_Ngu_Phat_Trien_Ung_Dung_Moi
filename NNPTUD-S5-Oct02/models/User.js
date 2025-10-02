const bcrypt = require('bcrypt');

class User {
  constructor(database) {
    this.db = database;
  }

  async create(userData) {
    const { username, password, email, fullName = '', avatarUrl = '', role } = userData;
    
    // Validation
    if (!username || username.trim() === '') {
      throw new Error('Username là bắt buộc');
    }
    
    if (!password || password.trim() === '') {
      throw new Error('Password là bắt buộc');
    }
    
    if (!email || email.trim() === '') {
      throw new Error('Email là bắt buộc');
    }
    
    // Check if username already exists
    const existingUserByUsername = this.findByUsername(username.trim());
    if (existingUserByUsername) {
      throw new Error('Username đã tồn tại');
    }
    
    // Check if email already exists
    const existingUserByEmail = this.findByEmail(email.trim());
    if (existingUserByEmail) {
      throw new Error('Email đã tồn tại');
    }
    
    // Check if role exists
    if (role) {
      const roles = this.db.getCollection('roles');
      const roleExists = roles.find(r => r.id === parseInt(role) && !r.isDelete);
      if (!roleExists) {
        throw new Error('Role không tồn tại');
      }
    }
    
    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    const newUser = {
      id: this.db.getNextId('users'),
      username: username.trim(),
      password: hashedPassword,
      email: email.trim(),
      fullName: fullName.trim(),
      avatarUrl: avatarUrl.trim(),
      status: false,
      role: role ? parseInt(role) : null,
      loginCount: 0,
      isDelete: false,
      createdAt: this.db.generateTimestamp(),
      updatedAt: this.db.generateTimestamp()
    };
    
    const users = this.db.getCollection('users');
    users.push(newUser);
    this.db.setCollection('users', users);
    
    return newUser;
  }

  findAll(filters = {}) {
    const { username, fullName, includeDeleted = false } = filters;
    let users = this.db.getCollection('users');
    
    // Filter by isDelete (soft delete)
    if (!includeDeleted) {
      users = users.filter(user => !user.isDelete);
    }
    
    // Filter by username (contains)
    if (username) {
      users = users.filter(user => 
        user.username.toLowerCase().includes(username.toLowerCase())
      );
    }
    
    // Filter by fullName (contains)
    if (fullName) {
      users = users.filter(user => 
        user.fullName.toLowerCase().includes(fullName.toLowerCase())
      );
    }
    
    return users;
  }

  findById(id) {
    return this.db.getCollection('users').find(u => u.id === parseInt(id) && !u.isDelete);
  }

  findByUsername(username) {
    return this.db.getCollection('users').find(u => u.username === username && !u.isDelete);
  }

  findByEmail(email) {
    return this.db.getCollection('users').find(u => u.email === email && !u.isDelete);
  }

  async update(id, updateData) {
    const users = this.db.getCollection('users');
    const userIndex = users.findIndex(u => u.id === parseInt(id) && !u.isDelete);
    
    if (userIndex === -1) {
      throw new Error('Không tìm thấy user với ID này');
    }
    
    const { username, password, email, fullName, avatarUrl, status, role, loginCount } = updateData;
    
    // Check if new username already exists (excluding current user)
    if (username && username.trim() !== '') {
      const existingUser = users.find(u => u.username === username.trim() && u.id !== parseInt(id) && !u.isDelete);
      if (existingUser) {
        throw new Error('Username đã tồn tại');
      }
    }
    
    // Check if new email already exists (excluding current user)
    if (email && email.trim() !== '') {
      const existingUser = users.find(u => u.email === email.trim() && u.id !== parseInt(id) && !u.isDelete);
      if (existingUser) {
        throw new Error('Email đã tồn tại');
      }
    }
    
    // Check if role exists
    if (role) {
      const roles = this.db.getCollection('roles');
      const roleExists = roles.find(r => r.id === parseInt(role) && !r.isDelete);
      if (!roleExists) {
        throw new Error('Role không tồn tại');
      }
    }
    
    // Update user
    if (username) users[userIndex].username = username.trim();
    if (email) users[userIndex].email = email.trim();
    if (fullName !== undefined) users[userIndex].fullName = fullName.trim();
    if (avatarUrl !== undefined) users[userIndex].avatarUrl = avatarUrl.trim();
    if (status !== undefined) users[userIndex].status = status;
    if (role !== undefined) users[userIndex].role = role ? parseInt(role) : null;
    if (loginCount !== undefined) users[userIndex].loginCount = Math.max(0, parseInt(loginCount));
    
    // Hash new password if provided
    if (password && password.trim() !== '') {
      const saltRounds = 10;
      users[userIndex].password = await bcrypt.hash(password, saltRounds);
    }
    
    users[userIndex].updatedAt = this.db.generateTimestamp();
    
    this.db.setCollection('users', users);
    return users[userIndex];
  }

  softDelete(id) {
    const users = this.db.getCollection('users');
    const userIndex = users.findIndex(u => u.id === parseInt(id) && !u.isDelete);
    
    if (userIndex === -1) {
      throw new Error('Không tìm thấy user với ID này');
    }
    
    users[userIndex].isDelete = true;
    users[userIndex].updatedAt = this.db.generateTimestamp();
    
    this.db.setCollection('users', users);
    return true;
  }

  async authenticate(email, username) {
    const user = this.db.getCollection('users').find(u => 
      u.email === email.trim() && 
      u.username === username.trim() && 
      !u.isDelete
    );
    
    if (!user) {
      throw new Error('Thông tin đăng nhập không chính xác');
    }
    
    // Update user status to true and increment login count
    const users = this.db.getCollection('users');
    const userIndex = users.findIndex(u => u.id === user.id);
    users[userIndex].status = true;
    users[userIndex].loginCount += 1;
    users[userIndex].updatedAt = this.db.generateTimestamp();
    
    this.db.setCollection('users', users);
    
    return users[userIndex];
  }
}

module.exports = User;
