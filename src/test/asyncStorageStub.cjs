const memory = new Map();

const state = {
  setItemKeys: [],
  throwOnGet: false
};

const api = {
  state,
  getItem: async (key) => {
    if (state.throwOnGet) {
      throw new Error("AsyncStorageException");
    }
    return memory.has(key) ? memory.get(key) : null;
  },
  setItem: async (key, value) => {
    state.setItemKeys.push(key);
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
