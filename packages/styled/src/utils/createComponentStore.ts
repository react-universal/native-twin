function createComponentStore() {
  let state = {};
  const subscribers = new Set();
  return {
    state,
    subscribers,
  };
}

export { createComponentStore };
