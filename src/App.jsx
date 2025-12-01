import React from './logo.svg';
import './App.css';
import Login from './pages/Login';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import CreateAccount from './pages/CreateAccount';
import PollsPage from './pages/PollsPage';
import PollsVoted from './pages/PollsVoted';
function App() {
  return (
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/create" element={<CreateAccount />} />
          <Route path="/polls" element={<PollsPage />} />
          <Route path="/voted" element={<PollsVoted />} />

        </Routes>
      </BrowserRouter>
    
  )
}

export default App;
