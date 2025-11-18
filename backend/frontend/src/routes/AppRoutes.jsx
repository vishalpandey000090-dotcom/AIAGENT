import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "../screens/Login";
import Register from "../screens/Register";
// import Home from "../screens/Home"; // uncomment if you have Home

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
