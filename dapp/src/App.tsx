import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainLayout from "./components/layout/MainLayout";
import Swap from "./pages/Swap";
import Home from "./pages/Home";
// import Users from "./pages/Users";
// import Settings from "./pages/Settings";

// Import the CSS for shadcn/ui
import "./index.css";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="/swap" element={<Swap />} />
          {/* <Route path="/users" element={<Users />} />
          <Route path="/settings" element={<Settings />} /> */}
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
