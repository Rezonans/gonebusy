import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';

class PickerItemList extends Component {
  render() {
    const p = this.props;

    let items = (p.items || []);
    if (p.wrapWithArrows)
      items = [
        { title: '<<', val: 'rev' },
        ...items,
        { title: '>>', val: 'fwd' },
      ];

    return <ul className={p.className}>
      {items.map((item, index) => {
        const {current, disabled} = item;
        const onClick = (p.onClick && !item.disabled) ? (() => { p.onClick(item, index); }) : undefined;
        return <li key={index} className={classNames({ current, disabled })} onClick={onClick}>
          <a>{item.title}</a>
        </li>;
      })}
    </ul>;
  }
}

PickerItemList.propTypes = {
  items: PropTypes.array,
  onClick: PropTypes.func,
  wrapWithArrows: PropTypes.bool
};

export default PickerItemList;
