const memory = new Map();

const state = {
  lastOptions: undefined,
  setItemKeys: [],
  throwOnGet: false
};

const stub = {
  AFTER_FIRST_UNLOCK: 1,
  state,
  getItemAsync: async (key, options) => {
    state.lastOptions = options;
    if (state.throwOnGet) {
      throw new Error("KeyChainException");
    }
    return memory.has(key) ? memory.get(key) : null;
  },
  setItemAsync: async (key, value, options) => {
    state.lastOptions = options;
    state.setItemKeys.push(key);
    memory.set(key, value);
  },
  deleteItemAsync: async (key, options) => {
    state.lastOptions = options;
    memory.delete(key);
  }
};

module.exports = stub;
