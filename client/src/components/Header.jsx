import { useState } from "react";
import Navleft from "./Navleft";
import Navright from "./Navright";

export const Header = () => {
  const [open, setOpen] = useState(false);

  return (
    <header
      data-aos="fade-down"
      className="px-4 lg:px-6 py-4 flex items-center justify-between border-b border-gray-200 shadow-sm bg-white"
    >
      <Navleft />

      {/* Desktop nav */}
      <div className="hidden lg:block">
        <Navright />
      </div>

      {/* Hamburger button */}
      <button
        onClick={() => setOpen(!open)}
        className="lg:hidden text-2xl"
      >
        ☰
      </button>

      {/* Mobile menu */}
      {open && (
        <div className="absolute top-16 right-4 bg-white border border-gray-200 rounded-xl shadow-lg p-5 lg:hidden">
          <Navright mobile />
        </div>
      )}
    </header>
  );
};
