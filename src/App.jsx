import React from './logo.svg';
import './App.css';
import Login from './pages/Login';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import CreateAccount from './pages/CreateAccount';
import PollsList from './pages/PollsList';
function App() {
  return (
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/create" element={<CreateAccount />} />
          <Route path="/polls" element={<PollsList />} />
        </Routes>
      </BrowserRouter>
    
  )
}

export default App;
