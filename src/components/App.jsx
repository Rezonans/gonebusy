import React, { Component } from 'react';
import { Breadcrumb, Image } from 'react-bootstrap';
import dogWalker from './DogWalker.svg';
import './App.css';

class App extends Component {
  constructor() {
    super();
    this.state = {};
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
              <h2 className="service-title">Shauna&#x27;s Best in Show Dog Walking Service</h2>

              <Image src={dogWalker} responsive thumbnail />
            </div>
            <div className="col-md-4">
              <h3 className="service-price">$10 / hour</h3>

              <Image src={dogWalker} responsive thumbnail />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
