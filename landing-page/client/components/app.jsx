import React, { Component } from 'react';
import { render } from 'react-dom';
import NavBar from './navbar.jsx';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {}
    this.createHeader = this.createHeader.bind(this);
  }

  render() {
    // content to be passed to createHeader
    let arr = [
      { name: 'Streamable', description: 'Provide seamless streaming video to clients with nile.js file sharing' },
      { name: 'Live', description: 'Create seamless live video streams for clients using nile.js' },
      { name: 'Scalable', description: 'Scale infinitely through peer-to-peer torrent file sharing network' }
      
    ];
    // set output of passing arr to createHeader to a variable
    let headers = arr.map(this.createHeader);
    return (
      <section>
        <NavBar />
        <div id="logoContainer">
          <img id="logo" src="https://cdn2.hubspot.net/hubfs/53/Case_Studies/Nile/nile-logo.png" />
        </div>
        <article id="footer">
          <section id="sections">
            <ul id="descriptionContainer">
              {headers}
            </ul>
          </section>
        </article>
      </section>
    )
  }

  // create header and description below logo on home page
  createHeader(props) {
    return <li key={props.name} className="descriptions">
      <h1 id={props.name.toLowerCase()} className="descriptionHead">{props.name}</h1>
      <p className="text">{props.description}</p>
    </li>
  }
}

export default App;