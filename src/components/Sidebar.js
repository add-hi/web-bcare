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
  Menu as MenuIcon,
  X as CloseIcon,
} from "lucide-react";
import useUser from "@/hooks/useUser";

// (opsional) Tooltip
import * as Tooltip from "@radix-ui/react-tooltip";
import Image from "next/image";

const menuItems = [
  { name: "Home", href: "/dashboard/home", icon: Home, hasSubmenu: false, division_codes: ["cxc"] },
  { name: "Complaint", href: "/dashboard/complaint", icon: FileText, hasSubmenu: false, division_codes: ["cxc"] },
  {
    name: "Dashboard",
    href: "/dashboard/mockdgo",
    icon: BarChart3,
    hasSubmenu: false,
    division_codes: ["uic1", "uic3", "uic6", "uic7", "uic8", "uic10", "uic11", "tbs", "opr"],
  },
];

export default function Sidebar({ onNavigate }) {
  const pathname = usePathname();
  const { user } = useUser();

  // Drawer mobile (overlay)
  const [mobileOpen, setMobileOpen] = useState(false);

  // Expand/collapse submenu (tetap pakai state yang sama)
  const [expandedMenus, setExpandedMenus] = useState({});
  const [expandedSubMenus, setExpandedSubMenus] = useState({});

  useEffect(() => {
    const newExpandedMenus = {};
    const newExpandedSubMenus = {};

    menuItems.forEach((item) => {
      if (item.submenu) {
        const hasActiveSub = item.submenu.some((sub) => {
          if (pathname === sub.href) return true;
          if (sub.subSubmenu) {
            const activeSubSub = sub.subSubmenu.some((ss) => pathname === ss.href);
            if (activeSubSub) {
              newExpandedSubMenus[sub.name] = true;
              return true;
            }
          }
          return false;
        });
        if (hasActiveSub) newExpandedMenus[item.name] = true;
      }
    });

    setExpandedMenus(newExpandedMenus);
    setExpandedSubMenus(newExpandedSubMenus);
  }, [pathname]);

  const toggleMenu = (menuName) =>
    setExpandedMenus((prev) => ({ ...prev, [menuName]: !prev[menuName] }));
  const toggleSubMenu = (subMenuName) =>
    setExpandedSubMenus((prev) => ({ ...prev, [subMenuName]: !prev[subMenuName] }));

  const isActiveParent = (item) => {
    if (pathname === item.href) return true;
    if (item.submenu) {
      return item.submenu.some((sub) => {
        if (pathname === sub.href) return true;
        if (sub.subSubmenu) return sub.subSubmenu.some((ss) => pathname === ss.href);
        return false;
      });
    }
    return false;
  };

  const isActiveSubParent = (subItem) => {
    if (pathname === subItem.href) return true;
    if (subItem.subSubmenu) return subItem.subSubmenu.some((s) => pathname === s.href);
    return false;
  };

  // Filter by division
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

  // Tutup drawer saat navigate (mobile)
  const handleNavigate = () => {
    onNavigate?.();
    setMobileOpen(false);
  };

  // Reusable: daftar menu penuh (dipakai di desktop & drawer mobile)
  const FullMenu = ({ compact = false }) => (
    <nav className="mb-6">
      <div className={`px-4 mb-3 mt-4 ${compact ? "" : ""}`}>
        <h3 className="text-xs uppercase text-gray-400 font-semibold tracking-wider">
          MAIN MENU
        </h3>
      </div>
      <ul className="space-y-1 px-2 pb-4">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || isActiveParent(item);

          return (
            <li key={item.name}>
              <div>
                {item.hasSubmenu ? (
                  <button
                    type="button"
                    className={`w-full flex items-center justify-between px-4 py-2 rounded-lg transition-colors ${active
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
                      className={`transition-transform duration-200 ${expandedMenus[item.name] ? "rotate-180" : ""
                        }`}
                    />
                  </button>
                ) : (
                  <Link
                    href={item.href}
                    onClick={handleNavigate}
                    className={`flex items-center px-4 py-2 rounded-lg transition-colors ${pathname === item.href
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
                      const subActive =
                        pathname === subItem.href || isActiveSubParent(subItem);

                      return (
                        <li key={subItem.name}>
                          <div>
                            {subItem.hasSubSubmenu ? (
                              <button
                                type="button"
                                className={`w-full flex items-center justify-between px-4 py-2 rounded-md text-sm transition-colors ${subActive
                                  ? "bg-slate-800 text-white"
                                  : "text-gray-400 hover:bg-slate-600 hover:text-white"
                                  }`}
                                onClick={() => toggleSubMenu(subItem.name)}
                              >
                                <div className="flex items-center space-x-3">
                                  {SubIcon && <SubIcon size={16} />}
                                  <span>{subItem.name}</span>
                                </div>
                                <ChevronRight
                                  size={14}
                                  className={`transition-transform duration-200 ${expandedSubMenus[subItem.name]
                                    ? "rotate-90"
                                    : ""
                                    }`}
                                />
                              </button>
                            ) : (
                              <Link
                                href={subItem.href}
                                onClick={handleNavigate}
                                className={`flex items-center space-x-3 px-4 py-2 rounded-md text-sm transition-colors ${pathname === subItem.href
                                  ? "bg-slate-800 text-white"
                                  : "text-gray-400 hover:bg-slate-600 hover:text-white"
                                  }`}
                              >
                                {SubIcon && <SubIcon size={16} />}
                                <span>{subItem.name}</span>
                              </Link>
                            )}

                            {/* Sub-submenu */}
                            {subItem.hasSubSubmenu &&
                              expandedSubMenus[subItem.name] &&
                              subItem.subSubmenu?.length > 0 && (
                                <ul className="mt-1 ml-6 space-y-1">
                                  {subItem.subSubmenu.map((ss) => (
                                    <li key={ss.name}>
                                      <Link
                                        href={ss.href}
                                        onClick={handleNavigate}
                                        className={`flex items-center space-x-3 px-4 py-2 rounded text-xs transition-colors ${pathname === ss.href
                                          ? "bg-slate-800 text-white"
                                          : "text-gray-400 hover:bg-slate-600 hover:text-white"
                                          }`}
                                      >
                                        <span>{ss.name}</span>
                                      </Link>
                                    </li>
                                  ))}
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
  );

  return (
    <aside className="fixed inset-y-0 left-0 z-30">
      {/* ========== MOBILE: Icon Rail + Hamburger (lg:hidden) ========== */}
      <div className="lg:hidden w-16 bg-slate-700 text-white min-h-screen flex flex-col items-center">
        {/* Header (avatar + hamburger) */}
        <div className="w-full flex items-center justify-between px-3 py-3 bg-slate-800 border-b border-slate-600 sm:h-[62px] md:h-[74px]">
          <button
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-500/50 hover:bg-slate-600"
          >
            <MenuIcon size={18} />
          </button>
        </div>

        {/* Icon-only rail */}
        <div className="mt-3 flex-1 w-full overflow-y-auto">
          {/* (opsional) Tooltip.Provider */}
          <Tooltip.Provider delayDuration={200}>
            <ul className="flex flex-col items-center gap-2">
              {visibleItems.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href || isActiveParent(item);

                // Jika item punya submenu, klik ikon pada rail akan buka drawer + expand item tsb
                const onClickIcon = () => {
                  if (item.hasSubmenu) {
                    setExpandedMenus((prev) => ({ ...prev, [item.name]: true }));
                    setMobileOpen(true);
                  }
                };

                const IconButton = (
                  <button
                    onClick={item.hasSubmenu ? onClickIcon : undefined}
                    className={`group h-10 w-10 rounded-lg flex items-center justify-center transition-colors ${active ? "bg-slate-800 text-white" : "text-gray-300 hover:bg-slate-600 hover:text-white"
                      }`}
                  >
                    <Icon size={20} />
                    <span className="sr-only">{item.name}</span>
                  </button>
                );

                return (
                  <li key={`rail-${item.name}`}>
                    {item.hasSubmenu ? (
                      // (opsional) Tooltip
                      <Tooltip.Root>
                        <Tooltip.Trigger asChild>{IconButton}</Tooltip.Trigger>
                        <Tooltip.Content className="rounded bg-black/80 text-white text-xs px-2 py-1">
                          {item.name}
                          <Tooltip.Arrow className="fill-black/80" />
                        </Tooltip.Content>
                      </Tooltip.Root>
                    ) : (
                      <Tooltip.Root>
                        <Tooltip.Trigger asChild>
                          <Link
                            href={item.href}
                            onClick={handleNavigate}
                            className={`group h-10 w-10 rounded-lg flex items-center justify-center transition-colors ${active ? "bg-slate-800 text-white" : "text-gray-300 hover:bg-slate-600 hover:text-white"
                              }`}
                          >
                            <Icon size={20} />
                            <span className="sr-only">{item.name}</span>
                          </Link>
                        </Tooltip.Trigger>
                        <Tooltip.Content className="rounded bg-black/80 text-white text-xs px-2 py-1">
                          {item.name}
                          <Tooltip.Arrow className="fill-black/80" />
                        </Tooltip.Content>
                      </Tooltip.Root>
                    )}
                  </li>
                );
              })}
            </ul>
          </Tooltip.Provider>
        </div>
      </div>

      {/* ========== DESKTOP: Sidebar penuh (lg:block) ========== */}
      <div className="hidden lg:flex w-64 bg-slate-700 text-white min-h-screen flex-col border-r border-slate-600">
        {/* Logo */}
        <div className="w-64 bg-slate-700 text-white px-6 py-4 shadow-[0_2px_4px_rgba(0,0,0,0.1)]">
          <Image
            src="/BNI_logo_white.svg"
            alt="BNI Logo"
            width={140}
            height={70}
            priority
          />
        </div>
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

        <FullMenu />
      </div>

      {/* ========== MOBILE: Drawer Overlay ========== */}
      <div
        className={`lg:hidden fixed inset-0 z-40 transition-opacity ${mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
      >
        <div
          className="absolute inset-0 bg-black/40"
          onClick={() => setMobileOpen(false)}
        />
        <div
          className={`absolute inset-y-0 left-0 w-80 max-w-[85vw] bg-slate-700 text-white shadow-xl border-r border-slate-600 transform transition-transform duration-300 ${mobileOpen ? "translate-x-0" : "-translate-x-full"
            }`}
        >
          {/* Drawer header */}
          <div className="flex items-center justify-between px-4 py-3 bg-slate-800 border-b border-slate-600">
            <div className="flex items-center gap-3">
              <div className="leading-tight">
                <div className="font-medium text-sm">{displayName}</div>
                <div className="text-xs text-gray-300">{displayId}</div>
                <div className="text-[10px] text-gray-400">{displayRole}</div>
              </div>
            </div>
            <button
              onClick={() => setMobileOpen(false)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-500/50 hover:bg-slate-600"
              aria-label="Close menu"
            >
              <CloseIcon size={18} />
            </button>
          </div>

          {/* Menu isi (lengkap) */}
          <FullMenu compact />
        </div>
      </div>
    </aside>
  );
}
