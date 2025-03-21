import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

const MainLayout: React.FC = () => {
  return (
    <div className="flex h-screen bg-zinc-900 text-zinc-50">
      <Sidebar />
      <main className="flex-1 overflow-y-auto transition-all duration-300 main-content md:ml-16">
        <div className="max-w-7xl mx-auto p-6 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
