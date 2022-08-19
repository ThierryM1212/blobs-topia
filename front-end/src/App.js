import './App.css';
import MyBlobsPage from './pages/my-blobs-page';
import Admin from "./pages/admin-page";
import Home from './pages/home-page';
import NavigationBar from './components/NavigationBar';
import 'react-bootstrap/dist/react-bootstrap.min.js';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import React from 'react';
import Footer from './components/Footer';
import BlobsShopPage from './pages/blobs-shop';
import MatchMakingPage from './pages/match-making';
import FightsPage from './pages/fights';
import HallOfFamePage from './pages/hall-of-fame';
import RequestBotPage from './pages/request-bot';
import AboutPage from './pages/about';
import OatmealShopPage from './pages/oatmeal-shop';
import { EditorPage } from './pages/editor-page';


export default class App extends React.Component {

  render() {
    return (
      <div className="App">
        <BrowserRouter >
          <NavigationBar />
          <Routes>
            <Route path={ "/"} element={<Home />} />
            <Route path={ "/create"} element={<EditorPage />} />
            <Route path={ "/myblobs"} element={<MyBlobsPage />} />
            <Route path={ "/blobsshop"} element={<BlobsShopPage />} />
            <Route path={ "/oatmealshop"} element={<OatmealShopPage />} />
            <Route path={ "/matchmaking"} element={<MatchMakingPage />} />
            <Route path={ "/request-bot"} element={<RequestBotPage />} />
            <Route path={ "/fights"} element={<FightsPage />} />
            <Route path={ "/halloffame"} element={<HallOfFamePage />} />
            <Route path={ "/about"} element={<AboutPage />} />
            <Route path={ "/admin"} element={<Admin />} />
          </Routes>
          <Footer />
        </BrowserRouter>
      </div>
    );
  }

}
