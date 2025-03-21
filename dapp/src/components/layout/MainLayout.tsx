import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

const MainLayout: React.FC = () => {
  return (
    <div className="flex h-screen bg-zinc-900 text-zinc-50">
      <Sidebar />
      <main className="flex-1 overflow-y-auto transition-all duration-300 main-content">
        <div className="w-full mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
