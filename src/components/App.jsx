import React, { Component } from 'react';
import { Breadcrumb, Image } from 'react-bootstrap';

import ProgressBar from 'react-progress-bar-plus';
import 'react-progress-bar-plus/lib/progress-bar.css';

import BusyAdapter from '../lib/BusyAdapter';
import defaults from '../lib/defaults';

import dogWalker from './DogWalker.svg';
import './App.css';

import Bookie from './Bookie';

class App extends Component {
  constructor() {
    super();
    this.state = {
      loading: false,
      serviceName: defaults.defaultServiceName
    };
    BusyAdapter.getServiceInfoAsync().then((info) => {
      this.setState({ serviceName: info.name });
    });
  }

  setLoading(loading) {
    this.setState({ loading });
  }

  render() {
    const s = this.state;

    return (
      <div className="container">
        <div className="site-detail">
          <ProgressBar percent={s.loading ? 3 : 100} autoIncrement intervalTime={150} />

          <h1>GigVillage.com</h1>

          <Breadcrumb>
            <Breadcrumb.Item>Services</Breadcrumb.Item>
            <Breadcrumb.Item>Pet</Breadcrumb.Item>
            <Breadcrumb.Item active>Dog Walking</Breadcrumb.Item>
          </Breadcrumb>

          <div className="row service-detail">
            <div className="col-md-8">
              <h2 className="service-title">{s.serviceName}</h2>

              <Image src={dogWalker} responsive thumbnail />
            </div>
            <div className="col-md-4">
              <h3 className="service-price">$10 / hour</h3>

              <Image src={dogWalker} responsive thumbnail />

              <Bookie onSetLoading={(loading) => { this.setLoading(loading); } } />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
