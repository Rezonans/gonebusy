class StateUpdaterBase {
  constructor(state, diff) {
    this.privateState = state;
    this.privateDiff = Object.assign({}, diff);
  }

  add(diff) {
    Object.assign(this.privateDiff, diff);
    return this;
  }

  state() {
    return Object.assign({}, this.privateState, this.privateDiff);
  }

  diff() {
    return Object.assign({}, this.privateDiff);
  }
}

export default StateUpdaterBase;
