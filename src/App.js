// Utils Imports
import React from "react";
import { Helmet } from "react-helmet";
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
import Contact from "./Pages/Contact";
import Gallery from "./Pages/Gallery";
import Home from "./Pages/Home";
import Investment from "./Pages/Investment.js";
import RoomDetail from "./Pages/RoomDetail";
import RoomList from "./Pages/RoomList.js";
import RegisterForm from "./Components/RegisterForm.js";
import CheckIn from "./Pages/CheckIn.js";
import CheckOut from "./Pages/CheckOut.js";

function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <Helmet>
        <title>Roseneath Holiday Park</title>
        <meta name="description" content="Official website for the Roseneath Holiday Park near Lake Willinton, the place for Camping, Caravan and Accomadation in the nature." />
        <meta name="keywords" content="Holiday, Roseneath, Camp, Caravan, Wild, Nature, Exploration, Willinton, Lake, Beach, Accomadatiob, Food, Service, Course, Facility, Storage, Landscape" />
      </Helmet>

      <div className='App'>
        <Navigation />
        <Routes>
          <Route exact path='/' element={<Home />} />
          <Route path='/gallery' element={<Gallery />} />
          <Route path='/about-us' element={<About />} />
          <Route path='/contact-us' element={<Contact />} />
          <Route path='/investment' element={<Investment />} />
          <Route path='/roomlist' element={<RoomList />} />
          <Route path='/room/:Name_en' element={<RoomDetail />} />
          <Route path='/register' element={<RegisterForm />} />
          <Route path='/check-in' element={<CheckIn />} />
          <Route path='/check-out' element={<CheckOut />} />
        </Routes>
        <Footer />
      </div>
    </I18nextProvider>
  );
}

export default App;
