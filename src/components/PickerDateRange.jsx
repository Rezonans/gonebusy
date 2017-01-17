import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';

class PickerDateRange extends Component {

  getItem(val, picking, isFocused, isStartNotEnd, onEvent) {
    const spanClassInfo = {
      pick: true,
      end: !isStartNotEnd,
      start: isStartNotEnd,
      picking
    };

    let result = null;

    if (isFocused && picking)
      result = <input
        type='text'
        defaultValue={val}
        autoFocus
        onBlur={event => { onEvent(isStartNotEnd, 'blur', event.target.value); } }
        />;
    else
      result = <span
        className={classNames(spanClassInfo)}
        onClick={() => { onEvent(isStartNotEnd, 'click'); } }>
        {val}
      </span>;

    return result;
  }

  render() {
    const { pickingStartNotEnd, isFocused, startValStr, endValStr, onEvent } = this.props;
    return <div className="range">
      {this.getItem(startValStr, pickingStartNotEnd, isFocused, true, onEvent)}
      <span>&nbsp;&mdash;&nbsp;</span>
      {this.getItem(endValStr, !pickingStartNotEnd, isFocused, false, onEvent)}
    </div>;
  }
}

PickerDateRange.propTypes = {
  pickingStartNotEnd: PropTypes.bool,
  isFocused: PropTypes.bool,
  startValStr: PropTypes.string,
  endValStr: PropTypes.string,
  onEvent: PropTypes.func,
};

export default PickerDateRange;
