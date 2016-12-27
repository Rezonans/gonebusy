import React, { Component } from 'react';
import './Bookie.css';

// import { Breadcrumb, Image } from 'react-bootstrap';
// import gonebusy from 'gonebusy-nodejs-client/lib';
// import { Promise } from 'bluebird';

// import dogWalker from './DogWalker.svg';

// const ServicesController = Promise.promisifyAll(gonebusy.ServicesController);

class Bookie extends Component {
  //   constructor() {
  //     super();
  //     gonebusy.configuration.BASEURI = 'http://sandbox.gonebusy.com/api/v1';
  //     const token = 'Token ac98ed08b5b0a9e7c43a233aeba841ce';
  //     this.state = { serviceName: 'Shauna\'s Best in Show Dog Walking Service' }

  //     ServicesController.getServicesAsync({ authorization: token }).then((response) => {
  //       // console.log('services', response);
  //       this.setState({ serviceName: response.services[0].name });
  //     });
  //   }

  render() {
    return (
      <div className="bookie-container">
        <div style={{ display: 'block', width: '100px', height: '100px', backgroundColor: 'red' }} />
      </div>

      // <div className="container">
      //   <div className="site-detail">
      //     <h1>GigVillage.com</h1>

      //     <Breadcrumb>
      //       <Breadcrumb.Item>Services</Breadcrumb.Item>
      //       <Breadcrumb.Item>Pet</Breadcrumb.Item>
      //       <Breadcrumb.Item active>Dog Walking</Breadcrumb.Item>
      //     </Breadcrumb>

      //     <div className="row service-detail">
      //       <div className="col-md-8">
      //         <h2 className="service-title">{this.state.serviceName}</h2>

      //         <Image src={dogWalker} responsive thumbnail />
      //       </div>
      //       <div className="col-md-4">
      //         <h3 className="service-price">$10 / hour</h3>

      //         <Image src={dogWalker} responsive thumbnail />
      //       </div>
      //     </div>
      //   </div>
      // </div>
    );
  }
}

export default Bookie;
