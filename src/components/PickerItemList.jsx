import React, { PureComponent, PropTypes } from 'react';
import classNames from 'classnames';

class PickerItemList extends PureComponent {
  render() {
    const { wrapWithArrows, forbidBack, forbidForward, className, onClick, items } = this.props;

    let itemsProcessed = (items || []);
    if (wrapWithArrows) {
      itemsProcessed = [
        { title: '<<', val: 'rev', disabled: forbidBack },
        ...itemsProcessed,
        { title: '>>', val: 'fwd', disabled: forbidForward },
      ];
    }

    return (<ul className={className}>
      {itemsProcessed.map((item, index) => {
        const { current, disabled } = item;
        const onItemClick = (onClick && !item.disabled) ?
          (() => { onClick(item, index); }) :
          undefined;
        return (<li key={index} className={classNames({ current, disabled })} onClick={onItemClick}>
          <a>{item.title}</a>
        </li>);
      })}
    </ul>);
  }
}

/* eslint react/forbid-prop-types: 0 */
PickerItemList.propTypes = {
  items: PropTypes.array.isRequired,
  onClick: PropTypes.func.isRequired,
  className: PropTypes.string,
  wrapWithArrows: PropTypes.bool,
  forbidBack: PropTypes.bool,
  forbidForward: PropTypes.bool,
};

PickerItemList.defaultProps = {
  className: undefined,
  wrapWithArrows: false,
  forbidBack: false,
  forbidForward: false,
};

export default PickerItemList;
