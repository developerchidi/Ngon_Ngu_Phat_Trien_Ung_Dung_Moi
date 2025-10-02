const fs = require('fs');
const path = require('path');

class Database {
  constructor() {
    this.dbPath = path.join(__dirname, 'db.json');
    this.data = this.loadDatabase();
  }

  loadDatabase() {
    try {
      const data = fs.readFileSync(this.dbPath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error loading database:', error);
      return { users: [], roles: [] };
    }
  }

  saveDatabase() {
    try {
      fs.writeFileSync(this.dbPath, JSON.stringify(this.data, null, 2));
      return true;
    } catch (error) {
      console.error('Error saving database:', error);
      return false;
    }
  }

  getCollection(collectionName) {
    return this.data[collectionName] || [];
  }

  setCollection(collectionName, data) {
    this.data[collectionName] = data;
    return this.saveDatabase();
  }

  getNextId(collectionName) {
    const collection = this.getCollection(collectionName);
    if (collection.length === 0) return 1;
    const maxId = Math.max(...collection.map(item => parseInt(item.id)));
    return maxId + 1;
  }

  generateTimestamp() {
    return new Date().toISOString();
  }
}

module.exports = Database;
