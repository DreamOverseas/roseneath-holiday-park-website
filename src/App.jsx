// Utils Imports
import React from "react";
import { I18nextProvider } from "react-i18next";
import { Route, Routes } from "react-router-dom";
import i18n from "./i18n.js"; // Ensure you have i18n setup correctly
import CuteChatbot from "@dreamoverseas/cute-chatbot";

// Style Imports
import "bootstrap-icons/font/bootstrap-icons.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

// Pages/Components Imports
import Footer from "./Components/Footer.jsx";
import Navigation from "./Components/Navigation.jsx";
import About from "./Pages/About.jsx";
import Contact from "./Pages/Contact.jsx";
import Gallery from "./Pages/Gallery.jsx";
import Home from "./Pages/Home.jsx";
import IndividualVisitors from "./Pages/IndividualVisitors.jsx";
import GroupVisitors from "./Pages/GroupVisitors.jsx";
import Investment from "./Pages/Investment.jsx";
import Cooperation from "./Pages/Cooperation.jsx";
import RoomDetail from "./Pages/RoomDetail.jsx";
import RoomList from "./Pages/RoomList.jsx";
import BookMembership from "./Pages/BookMembership.jsx";
import EcoAndCultureTours from "./Pages/EcoAndCultureTours.jsx";
import RegisterForm from "./Components/RegisterForm.jsx";
import CheckIn from "./Pages/CheckIn.jsx";
import CheckOut from "./Pages/CheckOut.jsx";
import News from "./Pages/News.jsx";
import AnnualNews from "./Pages/AnnualNews.jsx";
import PermanentNews from "./Pages/PermanentNews.jsx";
import Policy from "./Pages/Policy.jsx";
import MemberCenter from "./Pages/MembershipCenter.jsx";

function App() {

  const vite_openai_api_url = import.meta.env.VITE_OPENAI_API_URL;
  const vite_openai_asst_id = import.meta.env.VITE_OPENAI_ASST_ID;
  const vite_openai_api_key = import.meta.env.VITE_OPENAI_API_KEY;
  const vite_google_api = import.meta.env.VITE_GOOGLE_API;

  return (
    <I18nextProvider i18n={i18n}>

      <div className='App'>
        <Navigation />
        <Routes>
          <Route exact path='/' element={<Home />} />
          <Route path='/gallery' element={<Gallery />} />
          <Route path='/about-us' element={<About />} />
          <Route path='/contact-us' element={<Contact />} />
          <Route path='/policy' element={<Policy />} />
          <Route path='/individual-visitors' element={<IndividualVisitors />} />
          <Route path='/group-visitors' element={<GroupVisitors />} />
          <Route path='/investment' element={<Investment />} />
          <Route path='/cooperation' element={<Cooperation />} />
          <Route path='/roomlist' element={<RoomList />} />
          <Route path='/book-membership' element={<BookMembership />} />
          <Route path='/eco-and-culture-tours' element={<EcoAndCultureTours />} />
          <Route path='/room/:Name_en' element={<RoomDetail />} />
          <Route path='/register' element={<RegisterForm />} />
          <Route path='/check-in' element={<CheckIn />} />
          <Route path='/check-out' element={<CheckOut />} />
          <Route path='/news' element={<News />} />
          <Route path='/annual-news' element={<AnnualNews />} />
          <Route path='/permanent-news' element={<PermanentNews />} />
          <Route path='/membership' element={<MemberCenter />} />
        </Routes>
        <Footer />
        <CuteChatbot
          nickname='Roseneath Holiday Park'
          openai_api_url={`${vite_openai_api_url}`}
          openai_asst_id={`${vite_openai_asst_id}`}
          openai_api_key={`${vite_openai_api_key}`}
          google_api_key={`${vite_google_api}`}
        />
      </div>
    </I18nextProvider>
  );
}

export default App;
