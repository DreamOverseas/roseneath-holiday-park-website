// Utils Imports
import React from "react";
import { I18nextProvider } from "react-i18next";
import { Route, Routes } from "react-router-dom";
import i18n from "./i18n"; // Ensure you have i18n setup correctly

// Style Imports
import "bootstrap-icons/font/bootstrap-icons.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

// Pages/Components Imports
import Footer from "./Components/Footer";
import Navigation from "./Components/Navigation";
import About from "./Pages/About";
import Contact from "./Pages/Contact"
import Gallery from "./Pages/Gallery";
import Home from "./Pages/Home";
import Investment from "./Pages/Investment.js";
import Room from "./Pages/Room.js";

function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <div className='App'>
        <Navigation />
        <Routes>
          <Route exact path='/' element={<Home />} />
          <Route path='/gallery' element={<Gallery />} />
          <Route path='/about-us' element={<About />} />
          <Route path='/contact-us' element={<Contact />} />
          <Route path='/investment' element={<Investment />} />
          <Route path='/room' element={<Room />} />
        </Routes>
        <Footer />
      </div>
    </I18nextProvider>
  );
}

export default App;
