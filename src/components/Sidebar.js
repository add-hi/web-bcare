"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import {
  Home,
  FileText,
  BarChart3,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import useUser from "@/hooks/useUser"; // ← use the correct hook

const menuItems = [
  {
    name: "Home",
    href: "/dashboard/home",
    icon: Home,
    hasSubmenu: false,
    division_codes: ["cxc"], // CXC only
  },
  {
    name: "Complaint",
    href: "/dashboard/complaint",
    icon: FileText,
    hasSubmenu: false,
    division_codes: ["cxc"], // CXC only
  },
  {
    name: "Dashboard",
    href: "/dashboard/mockdgo",
    icon: BarChart3,
    hasSubmenu: false,
    division_codes: [
      "uic1",
      "uic3",
      "uic6",
      "uic7",
      "uic8",
      "uic10",
      "uic11",
      "tbs",
      "opr",
    ], // UIC/TBS/OPR
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useUser(); // ← from user hook
  const [expandedMenus, setExpandedMenus] = useState({});
  const [expandedSubMenus, setExpandedSubMenus] = useState({});

  useEffect(() => {
    const newExpandedMenus = {};
    const newExpandedSubMenus = {};

    menuItems.forEach((item) => {
      if (item.submenu) {
        const hasActiveSubmenu = item.submenu.some((sub) => {
          if (pathname === sub.href) return true;

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

        if (hasActiveSubmenu) newExpandedMenus[item.name] = true;
      }
    });

    setExpandedMenus(newExpandedMenus);
    setExpandedSubMenus(newExpandedSubMenus);
  }, [pathname]);

  const toggleMenu = (menuName) =>
    setExpandedMenus((prev) => ({ ...prev, [menuName]: !prev[menuName] }));

  const toggleSubMenu = (subMenuName) =>
    setExpandedSubMenus((prev) => ({
      ...prev,
      [subMenuName]: !prev[subMenuName],
    }));

  const isActiveParent = (item) => {
    if (pathname === item.href) return true;
    if (item.submenu) {
      return item.submenu.some((sub) => {
        if (pathname === sub.href) return true;
        if (sub.subSubmenu)
          return sub.subSubmenu.some((subSub) => pathname === subSub.href);
        return false;
      });
    }
    return false;
  };

  const isActiveSubParent = (subItem) => {
    if (pathname === subItem.href) return true;
    if (subItem.subSubmenu)
      return subItem.subSubmenu.some((s) => pathname === s.href);
    return false;
  };

  // Only show items allowed for the current division
  const visibleItems = useMemo(() => {
    const division = (
      user?.division_details?.division_code ||
      user?.division_code ||
      ""
    ).toLowerCase();
    return menuItems.filter((i) =>
      i.division_codes ? division && i.division_codes.includes(division) : true
    );
  }, [user]);

  const displayName = user?.full_name || user?.name || user?.email || "User";
  const displayId = user?.npp || user?.id || user?.employee_id || "";
  const displayRole = user?.role_details?.role_name || user?.role || "";
  const initial = displayName?.charAt(0) || "U";

  return (
    <aside className="w-64 bg-slate-700 text-white min-h-screen fixed left-0 top-18 bottom-0 overflow-y-auto">
      {/* User Info */}
      <div className="p-4 border-b border-slate-600 bg-slate-800">
        {user && (
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
              <span className="text-white font-medium">{initial}</span>
            </div>
            <div>
              <div className="font-medium">{displayName}</div>
              <div className="text-sm text-gray-300">{displayId}</div>
              <div className="text-xs text-gray-400">{displayRole}</div>
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
          {visibleItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.name}>
                <div>
                  {item.hasSubmenu ? (
                    <div
                      className={`flex items-center justify-between px-4 py-2 rounded-lg transition-colors cursor-pointer ${
                        isActiveParent(item)
                          ? "bg-slate-800 text-white"
                          : "text-gray-300 hover:bg-slate-600 hover:text-white"
                      }`}
                      onClick={() => toggleMenu(item.name)}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon size={18} />
                        <span className="font-medium">{item.name}</span>
                      </div>
                      <ChevronDown
                        size={16}
                        className={`transition-transform duration-200 ${
                          expandedMenus[item.name] ? "rotate-180" : ""
                        }`}
                      />
                    </div>
                  ) : (
                    <Link
                      href={item.href}
                      className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                        pathname === item.href
                          ? "bg-slate-800 text-white"
                          : "text-gray-300 hover:bg-slate-600 hover:text-white"
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon size={18} />
                        <span className="font-medium">{item.name}</span>
                      </div>
                    </Link>
                  )}

                  {item.hasSubmenu && expandedMenus[item.name] && (
                    <ul className="mt-2 ml-6 space-y-1">
                      {item.submenu?.map((subItem) => {
                        const SubIcon = subItem.icon;
                        return (
                          <li key={subItem.name}>
                            <div>
                              {subItem.hasSubSubmenu ? (
                                <div
                                  className={`flex items-center justify-between px-4 py-2 rounded-md text-sm transition-colors cursor-pointer ${
                                    isActiveSubParent(subItem)
                                      ? "bg-slate-800 text-white"
                                      : "text-gray-400 hover:bg-slate-600 hover:text-white"
                                  }`}
                                  onClick={() => toggleSubMenu(subItem.name)}
                                >
                                  <div className="flex items-center space-x-3">
                                    <SubIcon size={16} />
                                    <span>{subItem.name}</span>
                                  </div>
                                  <ChevronRight
                                    size={14}
                                    className={`transition-transform duration-200 ${
                                      expandedSubMenus[subItem.name]
                                        ? "rotate-90"
                                        : ""
                                    }`}
                                  />
                                </div>
                              ) : (
                                <Link
                                  href={subItem.href}
                                  className={`flex items-center space-x-3 px-4 py-2 rounded-md text-sm transition-colors ${
                                    pathname === subItem.href
                                      ? "bg-slate-800 text-white"
                                      : "text-gray-400 hover:bg-slate-600 hover:text-white"
                                  }`}
                                >
                                  <SubIcon size={16} />
                                  <span>{subItem.name}</span>
                                </Link>
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
    </aside>
  );
}
