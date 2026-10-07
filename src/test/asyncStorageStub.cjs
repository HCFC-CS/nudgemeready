const memory = new Map();

const api = {
  getItem: async (key) => (memory.has(key) ? memory.get(key) : null),
  setItem: async (key, value) => {
    memory.set(key, value);
  },
  removeItem: async (key) => {
    memory.delete(key);
  },
  clear: async () => {
    memory.clear();
  }
};

module.exports = api;
module.exports.default = api;
