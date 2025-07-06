"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";

const sidebarVariants = {
  open: {
    width: 260,
    transition: { type: "spring", stiffness: 600, damping: 50 },
  },
  closed: {
    width: 72,
    transition: { type: "spring", stiffness: 600, damping: 50 },
  },
};

const menuVariants = {
  open: { opacity: 1, height: "auto", transition: { duration: 0.3 } },
  closed: { opacity: 0, height: 0, transition: { duration: 0.2 } },
};

const menuItems = [
  {
    label: "Fatura",
    icon: (
      <svg
        width="24"
        height="24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="feather feather-file-text"
      >
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
    submenu: [
      { label: "Fatura Yükle", href: "/upload-document" },
      { label: "Fatura Listesi", href: "/list-documents" },
    ],
  },
  {
    label: "e-defter",
    icon: (
      <svg
        width="24"
        height="24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="feather feather-book-open"
      >
        <path d="M2 7v13a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7" />
        <path d="M16 3v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V3" />
      </svg>
    ),
    submenu: [
      { label: "e-Defter Görüntüle", href: "/e-defter-goruntule" },
      { label: "e-Defter Yükle", href: "/e-defter-yukle" },
    ],
  },
];

export default function HomeLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [openMenus, setOpenMenus] = useState([false, false]);
  const session = useSession();
  console.log(session);
  const toggleSidebar = () => setSidebarOpen((v) => !v);
  const toggleMenu = (idx) => {
    setOpenMenus((prev) => prev.map((open, i) => (i === idx ? !open : open)));
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Sidebar */}
      <motion.aside
        animate={sidebarOpen ? "open" : "closed"}
        variants={sidebarVariants}
        className="relative z-20 h-screen bg-white shadow-xl border-r border-gray-200 flex flex-col transition-all duration-300"
      >
        <div className="flex items-center justify-between px-4 py-5 border-b border-gray-100">
          <span className="font-bold text-xl text-indigo-600 tracking-tight whitespace-nowrap">
            {sidebarOpen ? "e-Arşiv" : "eA"}
          </span>
          <button
            onClick={toggleSidebar}
            className="ml-2 p-2 rounded hover:bg-gray-100 transition"
            aria-label="Toggle sidebar"
          >
            <svg
              className={`w-6 h-6 transition-transform ${
                sidebarOpen ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5" />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 19l-7-7 7-7"
              />
            </svg>
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto mt-2">
          <ul className="space-y-2 px-2">
            {menuItems.map((item, idx) => (
              <li key={item.label}>
                <button
                  className={`flex items-center w-full px-3 py-2 rounded-lg hover:bg-indigo-50 transition group ${
                    openMenus[idx] ? "bg-indigo-50" : ""
                  }`}
                  onClick={() => toggleMenu(idx)}
                  aria-expanded={openMenus[idx]}
                >
                  <span className="mr-3 text-indigo-500">{item.icon}</span>
                  <span
                    className={`flex-1 text-left font-medium text-gray-800 transition-all duration-200 ${
                      sidebarOpen
                        ? "opacity-100"
                        : "opacity-0 w-0 overflow-hidden"
                    }`}
                  >
                    {item.label}
                  </span>
                  <svg
                    className={`w-4 h-4 ml-auto text-gray-400 transition-transform duration-200 ${
                      openMenus[idx] ? "rotate-90" : ""
                    } ${
                      sidebarOpen
                        ? "opacity-100"
                        : "opacity-0 w-0 overflow-hidden"
                    }`}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
                <AnimatePresence initial={false}>
                  {openMenus[idx] && sidebarOpen && (
                    <motion.ul
                      key="submenu"
                      initial="closed"
                      animate="open"
                      exit="closed"
                      variants={menuVariants}
                      className="pl-10 pr-2 py-1 space-y-1"
                    >
                      {item.submenu.map((sub, subIdx) => (
                        <li key={sub.label}>
                          <Link
                            href={sub.href}
                            className="block px-3 py-2 rounded-md text-gray-700 hover:bg-indigo-100 hover:text-indigo-700 font-medium transition"
                          >
                            {sub.label}
                          </Link>
                        </li>
                      ))}
                    </motion.ul>
                  )}
                </AnimatePresence>
              </li>
            ))}
          </ul>
        </nav>
        <div>
          <button onClick={() => signOut()}>Sign Out</button>
        </div>
        <div className="mt-auto p-4 border-t border-gray-100 text-xs text-gray-400 text-center">
          &copy; {new Date().getFullYear()} e-Arşiv
        </div>
      </motion.aside>
      {/* Main Content */}
      <main className="flex-1 p-8 sm:p-12 bg-gradient-to-br from-white to-blue-50 min-h-screen overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
