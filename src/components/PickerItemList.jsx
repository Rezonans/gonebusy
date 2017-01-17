import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';

class PickerItemList extends Component {
  render() {
    const p = this.props;
    const { wrapWithArrows, forbidBack, forbidForward, className, onClick, } = p;

    let items = (p.items || []);
    if (wrapWithArrows)
      items = [
        { title: '<<', val: 'rev', disabled: forbidBack },
        ...items,
        { title: '>>', val: 'fwd', disabled: forbidForward },
      ];

    return <ul className={className}>
      {items.map((item, index) => {
        const {current, disabled} = item;
        const onItemClick = (onClick && !item.disabled) ? (() => { onClick(item, index); }) : undefined;
        return <li key={index} className={classNames({ current, disabled })} onClick={onItemClick}>
          <a>{item.title}</a>
        </li>;
      })}
    </ul>;
  }
}

PickerItemList.propTypes = {
  items: PropTypes.array,
  onClick: PropTypes.func,
  wrapWithArrows: PropTypes.bool,
  forbidBack: PropTypes.bool,
  forbidForward: PropTypes.bool
};

export default PickerItemList;
