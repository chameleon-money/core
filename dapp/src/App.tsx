import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainLayout from "./components/layout/MainLayout";
import Swap from "./pages/Swap";
import Home from "./pages/Home";
import Portfolio from "./pages/Portfolio";
import TokenBridgeFrontend from "./components/TokenBridgeFrontend";

import "./index.css";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="/swap" element={<Swap />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/debug" element={<TokenBridgeFrontend />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
