class StateUpdaterBase {
  constructor(state, diff) {
    this._state = state;
    this._diff = Object.assign({}, diff);
  }

  add(diff) {
    Object.assign(this._diff, diff);
    return this;
  }

  state() {
    return Object.assign({}, this._state, this._diff);
  }

  diff() {
    return Object.assign({}, this._diff);
  }
}

export default StateUpdaterBase;
