import { useState } from "react";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import "./App.css";
import Sidebar from "./components/Sidebar";
import Home from "./pages/Home";
import Starred from "./pages/Starred";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />}></Route>
          <Route path="/starred" element={<Starred />}></Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
