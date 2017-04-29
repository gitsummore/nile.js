import React, { Component } from 'react';
import ReactDOM from 'react-dom';

class NavBar extends Component {
  render() {
    let linkArr = ['Docs', 'Getting Started', 'Installation'];
    let links = linkArr.map(this.createLinks);
    return (
      <nav>
        <ul className="navContainer">
            { links }
        </ul>
      </nav>
    )
  }
  
  // create links in navbar
  createLinks(name) {
    console.log(name.toLowerCase());
    return <li id={name.toLowerCase()} className="navLinks" key={name}><a href="#">{ name }</a></li>
  }
}

export default NavBar;