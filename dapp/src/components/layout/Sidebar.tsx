import React, { useState } from "react";
import {
  X,
  Menu,
  Home,
  Package,
  ArrowsUpFromLine,
  User2Icon,
} from "lucide-react";
import { useLocation, NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

type SidebarProps = {
  className?: string;
};

type NavItem = {
  title: string;
  icon: React.ReactNode;
  href: string;
};

const navItems: NavItem[] = [
  { title: "Home", icon: <Home size={20} />, href: "/" },
  { title: "Swap", icon: <ArrowsUpFromLine size={20} />, href: "/swap" },
  { title: "Debug", icon: <Package size={20} />, href: "/debug" },
  { title: "Portfolio", icon: <User2Icon size={20} />, href: "/portoflio" },
];

const Sidebar = ({ className }: SidebarProps) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();

  const NavItems = () => (
    <>
      <div className="mb-4 px-4">
        <h2 className="text-xl font-bold text-white">Chameleon</h2>
      </div>
      <nav className="space-y-1 px-2">
        {navItems.map((item) => (
          <NavLink
            key={item.title}
            to={item.href}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                isActive
                  ? "bg-slate-800 text-white"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              )
            }
            end={item.href === "/"}
          >
            {item.icon}
            <span>{item.title}</span>
          </NavLink>
        ))}
      </nav>
    </>
  );

  return (
    <>
      <aside
        className={cn(
          "hidden h-screen w-64 flex-col bg-gray-950 p-4 md:flex",
          className
        )}
      >
        <NavItems />
      </aside>

      <div className="md:hidden">
        <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="fixed left-4 top-4 z-40"
            >
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent
            side="left"
            className="w-64 border-none bg-gray-950 p-0"
          >
            <div className="flex h-full flex-col p-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileOpen(false)}
                className="absolute right-4 top-4 text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </Button>
              <NavItems />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
};

export default Sidebar;
