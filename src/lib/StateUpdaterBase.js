class StateUpdaterBase {
  constructor(state, diff) {
    this.privateState = state;
    this.privateDiff = Object.assign({}, diff);
    this.privateVirtualState = Object.assign({}, state, diff);
  }

  add(diff) {
    Object.assign(this.privateDiff, diff);
    Object.assign(this.privateVirtualState, diff);
    return this;
  }

  state() {
    return Object.assign({}, this.privateState, this.privateDiff);
  }

  virtualState() {
    return this.privateVirtualState;
  }

  diff() {
    return Object.assign({}, this.privateDiff);
  }
}

export default StateUpdaterBase;
