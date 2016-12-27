import React, { Component } from 'react';
import { Breadcrumb, Image } from 'react-bootstrap';

import BusyAdapter, { busyDefaults } from '../lib/BusyAdapter';

import dogWalker from './DogWalker.svg';
import './App.css';

import Bookie from './Bookie.jsx';

class App extends Component {
  constructor() {
    super();
    this.state = { serviceName: busyDefaults.defaultServiceName };
    BusyAdapter.setServiceName(this);
  }

  render() {
    return (
      <div className="container">
        <div className="site-detail">
          <h1>GigVillage.com</h1>

          <Breadcrumb>
            <Breadcrumb.Item>Services</Breadcrumb.Item>
            <Breadcrumb.Item>Pet</Breadcrumb.Item>
            <Breadcrumb.Item active>Dog Walking</Breadcrumb.Item>
          </Breadcrumb>

          <div className="row service-detail">
            <div className="col-md-8">
              <h2 className="service-title">{this.state.serviceName}</h2>

              <Image src={dogWalker} responsive thumbnail />
            </div>
            <div className="col-md-4">
              <h3 className="service-price">$10 / hour</h3>

              <Image src={dogWalker} responsive thumbnail />

              <Bookie />

            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
