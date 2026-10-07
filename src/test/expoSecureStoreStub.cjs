const memory = new Map();

module.exports = {
  getItemAsync: async (key) => (memory.has(key) ? memory.get(key) : null),
  setItemAsync: async (key, value) => {
    memory.set(key, value);
  },
  deleteItemAsync: async (key) => {
    memory.delete(key);
  }
};
