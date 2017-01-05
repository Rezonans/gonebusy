import React, { Component } from 'react';

class PickerItemList extends Component {
  // define props (2do)

  render() {
    const p = this.props;

    let items = (p.items || []);
    if (p.wrapWithArrows)
      items = [
        { title: '<<', val: 'rev' },
        ...items,
        { title: '>>', val: 'fwd' },
      ];

    // npm i classnames 
    return <ul className={p.className}>
      {items.map((item, index) => {
        let itemClass = [];
        if (item.current)
          itemClass.push('current');
        if (item.disabled)
          itemClass.push('disabled');
        const onClick = (p.onLiClicked && !item.disabled) ? (() => { p.onLiClicked(item, index); }) : undefined;
        return <li key={index} className={itemClass.join(' ')} onClick={onClick}>
          <a>{item.title}</a>
        </li>;
      })}
    </ul>;
  }
}

export default PickerItemList;
