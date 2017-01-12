// import React, { Component, PropTypes } from 'react';
import React, { Component } from 'react';
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

    if (isFocused)
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
    const { startPicking, endPicking, startValStr, endValStr, startIsFocused, endIsFocused} = (this.props.data || {});
    const onEvent = this.props.onEvent;
    return <div className="range">
      {this.getItem(startValStr, startPicking, startIsFocused, true, onEvent)}
      <span>&nbsp;&mdash;&nbsp;</span>
      {this.getItem(endValStr, endPicking, endIsFocused, false, onEvent)}
    </div>;
  }
}

// PickerDateRange.propTypes = {
//   items: PropTypes.array,
//   onClick: PropTypes.func,
//   wrapWithArrows: PropTypes.bool
// };

export default PickerDateRange;
