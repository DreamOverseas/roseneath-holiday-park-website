import React from "react";
import "../Css/Home.css";
import logo from '../logo.svg';

const Home = () => {

    // TODO

    return (
        <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          <code>Javascript</code> is NOT <code>Java</code>, it's the best lan-guano-ge in the world.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          ~ Learn JAVAscript ~
        </a>
      </header>
    </div>
    );
};

export default Home;
