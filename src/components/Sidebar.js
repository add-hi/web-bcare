"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Home,
  FileText,
  BarChart3,
  ChevronDown,
  ChevronRight,
  PieChart,
  Banknote,
  MessageSquare,
} from "lucide-react";

const menuItems = [
  {
    name: "Home",
    href: "/dashboard/home",
    icon: Home,
    hasSubmenu: true,
    submenu: [
      { name: "Overview", href: "/dashboard/home", icon: PieChart },
    ],
  },
  {
    name: "Request",
    href: "/dashboard/request",
    icon: FileText,
    hasSubmenu: true,
    submenu: [
      {
        name: "Banking",
        href: "/dashboard/request/banking",
        icon: Banknote,
        hasSubSubmenu: true,
        subSubmenu: [
          {
            name: "Complaint",
            href: "/dashboard/request/banking/complaint",
            icon: MessageSquare,
          },
        ],
      },
    ],
  },
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: BarChart3,
    hasSubmenu: true,
    submenu: [
      { name: "Mock DGO", href: "/dashboard/mockdgo", icon: BarChart3 },
    ],
  }
];

export default function Sidebar() {
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [expandedMenus, setExpandedMenus] = useState({});
  const [expandedSubMenus, setExpandedSubMenus] = useState({});

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }

    // Auto expand menu and submenu if current path matches
    const newExpandedMenus = {};
    const newExpandedSubMenus = {};

    menuItems.forEach((item) => {
      if (item.submenu) {
        const hasActiveSubmenu = item.submenu.some((sub) => {
          // Check direct submenu match
          if (pathname === sub.href) return true;

          // Check sub-submenu match
          if (sub.subSubmenu) {
            const hasActiveSubSubmenu = sub.subSubmenu.some(
              (subSub) => pathname === subSub.href
            );
            if (hasActiveSubSubmenu) {
              newExpandedSubMenus[sub.name] = true;
              return true;
            }
          }
          return false;
        });

        if (hasActiveSubmenu) {
          newExpandedMenus[item.name] = true;
        }
      }
    });

    setExpandedMenus(newExpandedMenus);
    setExpandedSubMenus(newExpandedSubMenus);
  }, [pathname]);

  const toggleMenu = (menuName) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [menuName]: !prev[menuName],
    }));
  };

  const toggleSubMenu = (subMenuName) => {
    setExpandedSubMenus((prev) => ({
      ...prev,
      [subMenuName]: !prev[subMenuName],
    }));
  };

  const isActiveParent = (item) => {
    if (pathname === item.href) return true;
    if (item.submenu) {
      return item.submenu.some((sub) => {
        if (pathname === sub.href) return true;
        if (sub.subSubmenu) {
          return sub.subSubmenu.some((subSub) => pathname === subSub.href);
        }
        return false;
      });
    }
    return false;
  };

  const isActiveSubParent = (subItem) => {
    if (pathname === subItem.href) return true;
    if (subItem.subSubmenu) {
      return subItem.subSubmenu.some((subSub) => pathname === subSub.href);
    }
    return false;
  };

  return (
    <aside className="w-64 bg-slate-700 text-white min-h-screen fixed left-0 top-18 bottom-0 overflow-y-auto">
      {/* User Info */}
      <div className="p-4 border-b border-slate-600 bg-slate-800">
        {user && (
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
              <span className="text-white font-medium">
                {user.name.charAt(0)}
              </span>
            </div>
            <div>
              <div className="font-medium">{user.name}</div>
              <div className="text-sm text-gray-300">{user.id}</div>
              <div className="text-xs text-gray-400">{user.role}</div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="mt-6">
        <div className="px-4 mb-4">
          <h3 className="text-xs uppercase text-gray-400 font-semibold tracking-wider">
            MAIN MENU
          </h3>
        </div>

        <ul className="space-y-1 px-2">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <li key={item.name}>
                <div>
                  {/* Main Menu Item */}
                  <div
                    className={`flex items-center justify-between px-4 py-2 rounded-lg transition-colors cursor-pointer ${isActiveParent(item)
                      ? "bg-slate-800 text-white"
                      : "text-gray-300 hover:bg-slate-600 hover:text-white"
                      }`}
                    onClick={() =>
                      item.hasSubmenu ? toggleMenu(item.name) : null
                    }
                  >
                    <div className="flex items-center space-x-3">
                      <IconComponent size={18} />
                      <span className="font-medium">{item.name}</span>
                    </div>

                    {item.hasSubmenu && (
                      <ChevronDown
                        size={16}
                        className={`transition-transform duration-200 ${expandedMenus[item.name] ? "rotate-180" : ""
                          }`}
                      />
                    )}
                  </div>

                  {/* Submenu */}
                  {item.hasSubmenu && expandedMenus[item.name] && (
                    <ul className="mt-2 ml-6 space-y-1">
                      {item.submenu.map((subItem) => {
                        const SubIconComponent = subItem.icon;
                        return (
                          <li key={subItem.name}>
                            <div>
                              {/* Submenu Item */}
                              {subItem.hasSubSubmenu ? (
                                <div
                                  className={`flex items-center justify-between px-4 py-2 rounded-md text-sm transition-colors cursor-pointer ${isActiveSubParent(subItem)
                                    ? "bg-slate-800 text-white"
                                    : "text-gray-400 hover:bg-slate-600 hover:text-white"
                                    }`}
                                  onClick={() => toggleSubMenu(subItem.name)}
                                >
                                  <div className="flex items-center space-x-3">
                                    <SubIconComponent size={16} />
                                    <span>{subItem.name}</span>
                                  </div>
                                  <ChevronRight
                                    size={14}
                                    className={`transition-transform duration-200 ${expandedSubMenus[subItem.name]
                                      ? "rotate-90"
                                      : ""
                                      }`}
                                  />
                                </div>
                              ) : (
                                <Link
                                  href={subItem.href}
                                  className={`flex items-center space-x-3 px-4 py-2 rounded-md text-sm transition-colors ${pathname === subItem.href
                                    ? "bg-slate-800 text-white"
                                    : "text-gray-400 hover:bg-slate-600 hover:text-white"
                                    }`}
                                >
                                  <SubIconComponent size={16} />
                                  <span>{subItem.name}</span>
                                </Link>
                              )}

                              {/* Sub-submenu */}
                              {subItem.hasSubSubmenu &&
                                expandedSubMenus[subItem.name] && (
                                  <ul className="mt-2 ml-6 space-y-1">
                                    {subItem.subSubmenu.map((subSubItem) => {
                                      const SubSubIconComponent =
                                        subSubItem.icon;
                                      return (
                                        <li key={subSubItem.name}>
                                          <Link
                                            href={subSubItem.href}
                                            className={`flex items-center space-x-3 px-4 py-2 rounded-md text-xs transition-colors ${pathname === subSubItem.href
                                              ? "bg-slate-800 text-white border-l-2 border-blue-400"
                                              : "text-gray-500 hover:bg-slate-600 hover:text-white"
                                              }`}
                                          >
                                            <SubSubIconComponent size={14} />
                                            <span>{subSubItem.name}</span>
                                          </Link>
                                        </li>
                                      );
                                    })}
                                  </ul>
                                )}
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Manage Data Section - Commented out as in original */}
      {/* <div className="mt-8 px-4">
                <div className="bg-green-600 text-white px-3 py-1 rounded text-sm font-medium inline-block mb-4">
                    MANAGE DATA
                </div>
                <Link
                    href="/dashboard/manage-data"
                    className={`flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors ${pathname === '/dashboard/manage-data'
                            ? 'bg-slate-800 text-white'
                            : 'text-gray-300 hover:bg-slate-600 hover:text-white'
                        }`}
                >
                    <Database size={18} />
                    <span className="font-medium">Data Management</span>
                </Link>
            </div> */}
    </aside>
  );
}
