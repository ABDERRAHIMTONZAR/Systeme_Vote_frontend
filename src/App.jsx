import React from './logo.svg';
import './App.css';
import Login from './pages/Login';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import CreateAccount from './pages/CreateAccount';
import PollsPage from './pages/PollsPage';
import PollsVoted from './pages/PollsVoted';
import VotePage from './pages/VotePage';
import PollResultsPage from './pages/PollResultPage';
import DashboardPage from './pages/DashboardPage';
import PageNotFound from './pages/PageNotFound';
import CreatePoll from './pages/CreatePollPage';
import MyPolls from './pages/MyPolls';
import ProfilePage from './pages/ProfilPage';
import VerifyLogin from './pages/VerifyLogin'
import ForgotPassword from './pages/ForgotPassword';
function App() {
  return (
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/create" element={<CreateAccount />} />
          <Route path="/polls" element={<PollsPage />} />
          <Route path="/voted" element={<PollsVoted />} />
          <Route path="/polls/:id_sondage/vote" element={<VotePage />} />
          <Route path='/polls/:id_sondage/results' element={<PollResultsPage/>}/>
          <Route path='/dashboard' element={<DashboardPage/>}/>
          <Route path='/createPoll' element={<CreatePoll/>}/>
           <Route path='/management' element={<MyPolls/>}/>
           <Route path='/profile' element={<ProfilePage/>}/>
          <Route path="*" element={<PageNotFound />} />
          <Route path='/' element={<VerifyLogin/>}/>
<Route path="/forgot-password" element={<ForgotPassword />} />
        </Routes>
      </BrowserRouter>
    
  )
}

export default App;
