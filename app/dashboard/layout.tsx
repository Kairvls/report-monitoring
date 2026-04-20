"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const [reports, setReports] = useState<any[]>([]);
  const [showNotif, setShowNotif] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [user, setUser] = useState<any>({});
  const [preview, setPreview] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const infoRef = useRef<HTMLDivElement>(null);

  
  
  const pageLabel =
    pathname === "/dashboard"
      ? "Dashboard"
      : pathname.startsWith("/dashboard/reports")
      ? "Reports"
      : "System";

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch("/api/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      setUser(data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const roleColor =
    user?.role === "admin"
      ? "bg-black text-white"
      : "bg-gray-200 text-black";

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) router.replace("/login");
  }, [router]);

  const fetchReports = async () => {
    try {
      const res = await fetch("/api/reports");
      const data = await res.json();
      setReports(Array.isArray(data) ? data : []);
    } catch (err) {
      console.log(err);
      setReports([]);
    }
  };

  useEffect(() => {
    fetchReports();
    const interval = setInterval(fetchReports, 15000);
    return () => clearInterval(interval);
  }, []);

  const upcoming = useMemo(() => {
    const now = new Date();

    return reports.filter((r) => {
      if (!r.deadline) return false;

      const deadline = new Date(r.deadline);
      if (isNaN(deadline.getTime())) return false;

      const diff = deadline.getTime() - now.getTime();
      const days = diff / (1000 * 60 * 60 * 24);

      return days >= 0 && days <= 2;
    });
  }, [reports]);

  const totalReports = reports.length;

  const nearestUpcoming = upcoming.length
    ? [...upcoming].sort(
        (a, b) =>
          new Date(a.deadline).getTime() -
          new Date(b.deadline).getTime()
      )[0]
    : null;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotif(false);
      }

      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfile(false);
      }

      if (infoRef.current && !infoRef.current.contains(e.target as Node)) {
        setShowInfo(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const closeOnResize = () => {
      if (window.innerWidth >= 768) {
        setMobileOpen(false);
      }
    };

    window.addEventListener("resize", closeOnResize);
    return () => window.removeEventListener("resize", closeOnResize);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  const closeAllMenus = () => {
    setShowNotif(false);
    setShowProfile(false);
    setShowInfo(false);
    setMobileOpen(false);
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* BACKDROP */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-black/50 md:hidden z-40"
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`
          fixed top-0 z-50 h-screen
          ${mobileOpen ? "left-0" : "-left-full"}
          md:left-0 md:static
          ${collapsed ? "md:w-20" : "md:w-64"}
          w-[280px] sm:w-72
          transition-all duration-300 ease-in-out
          bg-gradient-to-br from-slate-900 via-black to-slate-900 text-white flex flex-col
          overflow-hidden shadow-2xl md:shadow-none
        `}
      >
        {/* TOP */}
        <div className="p-4 md:p-6 flex items-center justify-between border-b border-gray-800">
          {!collapsed && (
            <div className="group relative">
              <button type="button" className="flex items-center justify-center">
                <svg
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  strokeWidth="2"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 24 24"
                  className="w-8 h-8 hover:scale-110 duration-200 hover:stroke-blue-500"
                >
                  <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
                </svg>
              </button>

              <span className="absolute -top-14 left-1/2 -translate-x-1/2 z-20 origin-center scale-0 px-3 rounded-lg border border-gray-300 bg-white py-2 text-sm font-bold text-black shadow-md transition-all duration-300 ease-in-out group-hover:scale-100">
                GitHub
              </span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="hidden md:flex text-white text-lg cursor-pointer hover:bg-gray-100 p-2 rounded-full hover:text-black transition"
              type="button"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                fill="currentColor"
                className="bi bi-blockquote-right"
                viewBox="0 0 16 16"
              >
                <path d="M2.5 3a.5.5 0 0 0 0 1h11a.5.5 0 0 0 0-1zm0 3a.5.5 0 0 0 0 1h6a.5.5 0 0 0 0-1zm0 3a.5.5 0 0 0 0 1h6a.5.5 0 0 0 0-1zm0 3a.5.5 0 0 0 0 1h11a.5.5 0 0 0 0-1zm10.113-5.373a7 7 0 0 0-.445-.275l.21-.352q.183.111.452.287.27.176.51.428.234.246.398.562.164.31.164.692 0 .54-.216.873-.217.328-.721.328-.322 0-.504-.211a.7.7 0 0 1-.188-.463q0-.345.211-.521.205-.182.569-.182h.281a1.7 1.7 0 0 0-.123-.498 1.4 1.4 0 0 0-.252-.37 2 2 0 0 0-.346-.298m-2.168 0A7 7 0 0 0 10 6.352L10.21 6q.183.111.452.287.27.176.51.428.234.246.398.562.164.31.164.692 0 .54-.216.873-.217.328-.721.328-.322 0-.504-.211a.7.7 0 0 1-.188-.463q0-.345.211-.521.206-.182.569-.182h.281a1.8 1.8 0 0 0-.117-.492 1.4 1.4 0 0 0-.258-.375 2 2 0 0 0-.346-.3z" />
              </svg>
            </button>

            <button
              onClick={() => setMobileOpen(false)}
              className="md:hidden p-2 rounded-lg hover:bg-white/10 transition cursor-pointer"
              type="button"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* NAV */}
        <nav className="flex-1 p-4 space-y-3 overflow-y-auto">
          <Link
            href="/dashboard"
            onClick={closeAllMenus}
            className="group flex items-center gap-3 px-3 py-3 w-full rounded-xl relative"
          >
            <span
              className={`
                absolute inset-0 rounded-xl transition-all duration-200
                ${
                  pathname === "/dashboard"
                    ? "bg-gray-900"
                    : "bg-transparent group-hover:bg-gray-800"
                }
              `}
            />

            <div className="relative z-10 flex items-center gap-3 w-full min-w-0">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                fill="currentColor"
                className="bi bi-house shrink-0"
                viewBox="0 0 16 16"
              >
                <path d="M8.707 1.5a1 1 0 0 0-1.414 0L.646 8.146a.5.5 0 0 0 .708.708L2 8.207V13.5A1.5 1.5 0 0 0 3.5 15h9a1.5.5 0 0 0 1.5-1.5V8.207l.646.647a.5.5 0 0 0 .708-.708L13 5.793V2.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1.293zM13 7.207V13.5a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5V7.207l5-5z" />
              </svg>

              <span
                className={`
                  whitespace-nowrap transition-all duration-200
                  ${collapsed ? "md:opacity-0 md:w-0 md:overflow-hidden" : "opacity-100"}
                `}
              >
                Dashboard
              </span>
            </div>
          </Link>

          <Link
            href="/dashboard/reports"
            onClick={closeAllMenus}
            className="group flex items-center gap-3 px-3 py-3 w-full rounded-xl relative"
          >
            <span
              className={`
                absolute inset-0 rounded-xl transition-all duration-200
                ${
                  pathname.startsWith("/dashboard/reports")
                    ? "bg-gray-900"
                    : "bg-transparent group-hover:bg-gray-800"
                }
              `}
            />

            <div className="relative z-10 flex items-center gap-3 w-full min-w-0">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                fill="currentColor"
                className="bi bi-folder-plus shrink-0"
                viewBox="0 0 16 16"
              >
                <path d="m.5 3 .04.87a2 2 0 0 0-.342 1.311l.637 7A2 2 0 0 0 2.826 14H9v-1H2.826a1 1 0 0 1-.995-.91l-.637-7A1 1 0 0 1 2.19 4h11.62a1 1 0 0 1 .996 1.09L14.54 8h1.005l.256-2.819A2 2 0 0 0 13.81 3H9.828a2 2 0 0 1-1.414-.586l-.828-.828A2 2 0 0 0 6.172 1H2.5a2 2 0 0 0-2 2m5.672-1a1 1 0 0 1 .707.293L7.586 3H2.19q-.362.002-.683.12L1.5 2.98a1 1 0 0 1 1-.98z" />
                <path d="M13.5 9a.5.5 0 0 1 .5.5V11h1.5a.5.5 0 1 1 0 1H14v1.5a.5.5 0 1 1-1 0V12h-1.5a.5.5 0 0 1 0-1H13V9.5a.5.5 0 0 1 .5-.5" />
              </svg>

              <span
                className={`
                  whitespace-nowrap transition-all duration-200
                  ${collapsed ? "md:opacity-0 md:w-0 md:overflow-hidden" : "opacity-100"}
                `}
              >
                Reports
              </span>
            </div>
          </Link>
        </nav>
      </aside>

      {/* MAIN */}
      <div className="flex-1 flex flex-col min-w-0 w-full md:ml-0">
        {/* HEADER */}
        <header className="min-h-[64px] md:h-20 bg-white border-b px-3 sm:px-4 md:px-6 py-3 md:py-4">
          <div className="flex items-center justify-between w-full">
            {/* LEFT */}
            <div className="flex items-center gap-3">
              <button
                className="md:hidden p-2 rounded-lg bg-gray-800 hover:bg-gray-600 shrink-0 cursor-pointer"
                onClick={() => setMobileOpen(true)}
                type="button"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="black"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

              <div ref={infoRef} className="relative inline-block shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setShowInfo((prev) => !prev);
                    setShowNotif(false);
                    setShowProfile(false);
                  }}
                  className="relative px-3 sm:px-4 md:px-5 py-2.5 text-xs sm:text-sm font-semibold text-white bg-gray-900/90 rounded-xl hover:bg-gray-700/90 focus:outline-none transition-all duration-300 overflow-hidden cursor-pointer"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 blur-xl opacity-70"></div>

                  <span className="relative flex items-center gap-2">
                    <svg
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      fill="none"
                      className="w-4 h-4"
                    >
                      <path
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        strokeWidth="2"
                        strokeLinejoin="round"
                        strokeLinecap="round"
                      ></path>
                    </svg>
                    <span className="hidden sm:inline">Tap for Info</span>
                    <span className="sm:hidden">Info</span>
                  </span>
                </button>

                {showInfo && (
                  <>
                    <div
                      className="fixed inset-0 z-40 md:hidden"
                      onClick={() => setShowInfo(false)}
                    />
                    <div className="fixed md:absolute top-[92px] md:top-full left-1/2 -translate-x-1/2 md:left-0 md:translate-x-0 md:ml-1 mt-0 md:mt-2 z-50 w-[calc(100vw-24px)] max-w-[360px] md:w-[22rem]">
                      <div className="relative rounded-2xl border border-white/10 bg-gradient-to-br from-gray-900/95 to-gray-800/95 p-3 sm:p-4 backdrop-blur-md shadow-[0_0_30px_rgba(79,70,229,0.15)]">
                        <div className="mb-3 flex items-start gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-500/20">
                            <svg
                              viewBox="0 0 20 20"
                              fill="currentColor"
                              className="h-4 w-4 text-indigo-400"
                            >
                              <path
                                clipRule="evenodd"
                                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                fillRule="evenodd"
                              />
                            </svg>
                          </div>
                      
                          <div className="min-w-0 w-full">
                            <h3 className="text-sm font-semibold text-white">
                              Hello, {user?.full_name || "User"}
                            </h3>
                      
                            <p className="mt-1 break-words text-xs leading-relaxed text-gray-300 sm:text-sm">
                              You are viewing the{" "}
                              <span className="font-medium text-white">{pageLabel}</span> page.
                            </p>
                      
                            <div className="mt-3 space-y-2 text-[11px] sm:text-xs text-gray-300">
                              <div className="flex items-center justify-between gap-3">
                                <span className="text-gray-400">Role</span>
                                <span className="font-medium text-white">
                                  {user?.role || "User"}
                                </span>
                              </div>
                      
                              <div className="flex items-center justify-between gap-3">
                                <span className="text-gray-400">Total Reports</span>
                                <span className="font-medium text-white">{totalReports}</span>
                              </div>
                      
                              <div className="flex items-center justify-between gap-3">
                                <span className="text-gray-400">Upcoming Deadlines</span>
                                <span className="font-medium text-white">{upcoming.length}</span>
                              </div>
                      
                              <div className="flex items-center justify-between gap-3">
                                <span className="text-gray-400">Nearest Deadline</span>
                                <span className="font-medium text-white text-right">
                                  {nearestUpcoming
                                    ? new Date(nearestUpcoming.deadline).toLocaleDateString()
                                    : "No upcoming"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      
                        <div className="flex items-center gap-2 text-[11px] text-gray-400 sm:text-xs">
                          <svg
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            className="h-4 w-4 shrink-0"
                          >
                            <path
                              clipRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              fillRule="evenodd"
                            />
                          </svg>
                          <span>Live dashboard data</span>
                        </div>
                      
                        <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-500/10 to-purple-500/10 blur-xl opacity-50"></div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* RIGHT */}
            <div className="flex items-center gap-3 relative shrink-0">
              {/* NOTIFICATIONS */}
              <div ref={notifRef} className="relative">
                <button
                  onClick={() => {
                    setShowNotif((prev) => !prev);
                    setShowProfile(false);
                    setShowInfo(false);
                  }}
                  className="relative p-2 rounded-full cursor-pointer hover:bg-gray-100"
                  type="button"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    fill="black"
                    className="bi bi-bell-fill"
                    viewBox="0 0 16 16"
                  >
                    <path d="M8 16a2 2 0 0 0 2-2H6a2 2 0 0 0 2 2m.995-14.901a1 1 0 1 0-1.99 0A5 5 0 0 0 3 6c0 1.098-.5 6-2 7h14c-1.5-1-2-5.902-2-7 0-2.42-1.72-4.44-4.005-4.901" />
                  </svg>

                  {upcoming.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center">
                      {upcoming.length}
                    </span>
                  )}
                </button>

                {showNotif && (
                  <>
                    <div
                      className="fixed inset-0 z-40 md:hidden"
                      onClick={() => setShowNotif(false)}
                    />
                    <div className="fixed md:absolute top-[92px] md:top-full left-1/2 -translate-x-1/2 md:left-auto md:right-0 md:translate-x-0 mt-0 md:mt-2 z-50 w-[calc(100vw-24px)] max-w-[360px] md:w-[22rem] overflow-hidden rounded-2xl border bg-white shadow-lg">
                      <div className="border-b p-3 text-sm font-semibold text-black sm:text-base">
                        Upcoming Deadlines (2 days)
                      </div>

                      <div className="max-h-64 overflow-y-auto">
                        {upcoming.length === 0 ? (
                          <p className="p-3 text-sm text-gray-500">
                            No upcoming deadlines
                          </p>
                        ) : (
                          upcoming.map((r) => (
                            <div
                              key={r.id}
                              className="border-b p-3 hover:bg-gray-50"
                            >
                              <p className="break-words text-sm font-medium leading-snug text-black">
                                {r.report_name}
                              </p>

                              <p className="mt-1 text-xs text-red-600">
                                Due: {new Date(r.deadline).toLocaleDateString()}
                              </p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* PROFILE */}
              <div ref={profileRef} className="relative">
                <button
                  onClick={() => {
                    setShowProfile((prev) => !prev);
                    setShowNotif(false);
                    setShowInfo(false);
                  }}
                  className="flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2 cursor-pointer rounded-full bg-gray-100 hover:bg-gray-200 transition-all duration-200 max-w-[220px] sm:max-w-none"
                  type="button"
                >
                  <div className="w-9 h-9 rounded-full overflow-hidden bg-gray-200 shadow-lg shrink-0">
                    {preview || user.avatar ? (
                      <img
                        src={preview || user.avatar}
                        className="w-full h-full object-cover"
                        alt="User avatar"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-black text-white text-lg font-bold">
                        {user.username?.charAt(0)?.toUpperCase() || "U"}
                      </div>
                    )}
                  </div>

                  <div className="hidden sm:block text-left leading-tight min-w-0">
                    <p className="text-sm text-gray-800 truncate max-w-[120px] md:max-w-[160px]">
                      {user?.full_name || "Welcome"}
                    </p>
                    <p className="text-xs text-gray-500 truncate max-w-[120px] md:max-w-[160px]">
                      @{user?.username || "loading..."}
                    </p>
                  </div>

                  <p
                    className={`hidden md:block text-xs font-semibold px-2 py-1 rounded-md ${roleColor}`}
                  >
                    {user?.role || "User"}
                  </p>

                  <svg
                    className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
                      showProfile ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {showProfile && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border rounded-2xl shadow-lg z-50 overflow-hidden">
                    <button
                      onClick={() => {
                        setShowProfile(false);
                        router.push("/dashboard/profile");
                      }}
                      className="w-full text-left px-4 py-3 text-black hover:bg-gray-100 text-sm"
                    >
                      Profile
                    </button>

                    <button
                      onClick={() => {
                        setShowProfile(false);
                        router.push("/dashboard/settings");
                      }}
                      className="w-full text-left px-4 py-3 text-black hover:bg-gray-100 text-sm"
                    >
                      Settings
                    </button>

                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-3 cursor-pointer text-red-600 hover:bg-gray-100 text-sm"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* CONTENT */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 lg:p-8 transition-all duration-300">
          {children}
        </main>
      </div>
    </div>
  );
}
