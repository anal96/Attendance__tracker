
import React, { useState } from "react";
import Index from "../src/components/index";
import Register from "./components/Register";
import Login from "./components/login";
import {BrowserRouter , Route, Routes} from 'react-router-dom';
export default function App() {
  return (
    <div>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index/>}/>
        <Route path="/login" element={<Login/>}/>
        <Route path="/register" element={<Register/>}/>
      </Routes>
    </BrowserRouter>
    </div>
  );
}