import React from './logo.svg';
import './App.css';
import Login from './pages/Login';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import CreateAccount from './pages/CreateAccount';
function App() {
  return (
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/create" element={<CreateAccount />} />
        </Routes>
      </BrowserRouter>
    
  )
}

export default App;
