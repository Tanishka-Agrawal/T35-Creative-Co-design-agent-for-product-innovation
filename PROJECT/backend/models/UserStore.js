
const { randomUUID } = require('crypto');

class UserStore {
  constructor() {
    this.usersById = new Map();
    this.emailIndex = new Map();
  }

  async findOne(query) {
    if (query.email) {
      const emailKey = String(query.email).toLowerCase();
      const id = this.emailIndex.get(emailKey);
      if (!id) return null;
      return this.usersById.get(id) || null;
    }
    return null;
  }

  async create(user) {
    const id = randomUUID();
    const doc = {
      _id: id,
      name: user.name,
      email: String(user.email).toLowerCase(),
      password: user.password,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.usersById.set(id, doc);
    this.emailIndex.set(doc.email, id);
    return doc;
  }

  async findById(id) {
    return this.usersById.get(id) || null;
  }
}

module.exports = new UserStore();