// Utils Imports
import React from "react";
import { Route, Routes } from "react-router-dom";
// Style Imports
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './App.css';
// Pages/Components Imports
import Navbar from './Components/Navbar';
import Footer from './Components/Footer';
import Home from './Pages/Home';
import FindUs from './Pages/FindUs';
import Gallery from './Pages/Gallery';
import About from './Pages/About';
import Contact from './Pages/Contact';


function App() {
  return (
    <div className='App'>
      <Navbar />
      <Routes>
        <Route exact path='/' element={<Home />} />
        <Route path='/find-us' element={<FindUs />} />
        <Route path='/gallery' element={<Gallery />} />
        <Route path='/about-us' element={<About />} />
        <Route path='/contact-us' element={<Contact />} />
      </Routes>
      <Footer />
    </div>
  );
}

export default App;
