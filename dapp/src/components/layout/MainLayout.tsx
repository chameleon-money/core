import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import RetroGradientBackground from "./RetroGradientBackground";

const MainLayout: React.FC = () => {
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-950 text-gray-200">
      <div
        className="flex h-screen text-zinc-50 w-full"
        style={{
          backgroundImage: 'url("/memphis-mini-dark.webp")',
          // backgroundSize: "100px",
          backgroundRepeat: "repeat",
        }}
      >
        <Sidebar />
        <main className="flex-1 overflow-y-auto transition-all duration-300 main-content">
          <div className="w-full mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
