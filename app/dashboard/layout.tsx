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

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const [collapsed, setCollapsed] = useState(false);

  const [user, setUser] = useState<any>({});

  const [preview, setPreview] = useState<string | null>(null);



  const fetchProfile = async () => {
    const token = localStorage.getItem("token");

    const res = await fetch("/api/profile", {
        headers: {
        Authorization: `Bearer ${token}`,
        },
    });

    const data = await res.json();
    setUser(data);
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const roleColor =
      user?.role === "admin"
        ? "bg-black text-white"
        : "bg-gray-200 text-black";

  // 🔐 AUTH CHECK (ONLY ONCE)
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) router.replace("/login");
  }, []);

  // 📦 FETCH REPORTS
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

    // optional auto-refresh (real-time feel)
    const interval = setInterval(fetchReports, 15000);
    return () => clearInterval(interval);
  }, []);

  // ⏰ UPCOMING DEADLINES (2 DAYS RULE)
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

  // ❌ CLOSE DROPDOWNS WHEN CLICK OUTSIDE
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotif(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfile(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex h-screen bg-gray-100">

      {/* SIDEBAR */}
      <aside
        className={`
          ${collapsed ? "w-20" : "w-64"}
          transition-all duration-300 ease-in-out
          shrink-0 bg-gradient-to-br from-slate-900 via-black to-slate-900 text-white flex flex-col
          overflow-hidden rounded-br-4xl
        `}
      >
        {/* TOP */}
        <div className="p-6 flex items-center justify-between border-b border-gray-800">
          {!collapsed && (
            
            <div className="group relative">
              <button>
              <svg stroke-linejoin="round" stroke-linecap="round" stroke-width="2" stroke="currentColor" fill="none" viewBox="0 0 24 24" className="w-8 hover:scale-125 duration-200 hover:stroke-blue-500"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
              </button>
              <span className="absolute -top-14 left-[50%] -translate-x-[50%] 
              z-20 origin-left scale-0 px-3 rounded-lg border 
              border-gray-300 bg-white py-2 text-sm font-bold
              shadow-md transition-all duration-300 ease-in-out 
              group-hover:scale-100">GitHub<span>
            </span></span></div>
          )}

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-white text-lg cursor-pointer hover:bg-gray-100 p-1 rounded-full hover:text-black"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" className="bi bi-blockquote-right" viewBox="0 0 16 16">
              <path d="M2.5 3a.5.5 0 0 0 0 1h11a.5.5 0 0 0 0-1zm0 3a.5.5 0 0 0 0 1h6a.5.5 0 0 0 0-1zm0 3a.5.5 0 0 0 0 1h6a.5.5 0 0 0 0-1zm0 3a.5.5 0 0 0 0 1h11a.5.5 0 0 0 0-1zm10.113-5.373a7 7 0 0 0-.445-.275l.21-.352q.183.111.452.287.27.176.51.428.234.246.398.562.164.31.164.692 0 .54-.216.873-.217.328-.721.328-.322 0-.504-.211a.7.7 0 0 1-.188-.463q0-.345.211-.521.205-.182.569-.182h.281a1.7 1.7 0 0 0-.123-.498 1.4 1.4 0 0 0-.252-.37 2 2 0 0 0-.346-.298m-2.168 0A7 7 0 0 0 10 6.352L10.21 6q.183.111.452.287.27.176.51.428.234.246.398.562.164.31.164.692 0 .54-.216.873-.217.328-.721.328-.322 0-.504-.211a.7.7 0 0 1-.188-.463q0-.345.211-.521.206-.182.569-.182h.281a1.8 1.8 0 0 0-.117-.492 1.4 1.4 0 0 0-.258-.375 2 2 0 0 0-.346-.3z"/>
            </svg>
          </button>
        </div>

        {/* NAV */}
        <nav className="flex-1 p-4 space-y-4">
          <Link
              href="/dashboard"
              className="group flex items-center gap-2 px-3 py-2 w-full rounded-l-md transition-all duration-200 relative"
            >
              {/* FULL BACKGROUND (ACTIVE + HOVER) */}
              <span
                className={`
                  absolute inset-0 rounded-l-md transition-all duration-200

                  ${
                    pathname === "/dashboard"
                      ? "bg-gray-900"
                      : "bg-transparent group-hover:bg-gray-800"
                  }
                `}
              />

              {/* CONTENT (ICON + TEXT ALWAYS ABOVE BACKGROUND) */}
              <div className="relative z-10 flex items-center gap-2 w-full">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-house" viewBox="0 0 16 16">
                                    <path d="M8.707 1.5a1 1 0 0 0-1.414 0L.646 8.146a.5.5 0 0 0 .708.708L2 8.207V13.5A1.5 1.5 0 0 0 3.5 15h9a1.5 1.5 0 0 0 1.5-1.5V8.207l.646.647a.5.5 0 0 0 .708-.708L13 5.793V2.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1.293zM13 7.207V13.5a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5V7.207l5-5z"/>
                                  </svg>

                <span
                  className={`
                    transition-all duration-200
                    ${collapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"}
                  `}
                >
                  Dashboard
                </span>
              </div>
            </Link>

          <Link
              href="/dashboard/reports"
              className="group flex items-center gap-2 px-3 py-2 w-full rounded-l-md transition-all duration-200 relative"
            >
              {/* FULL BACKGROUND */}
              <span
                className={`
                  absolute inset-0 rounded-l-md transition-all duration-200

                  ${
                    pathname.startsWith("/dashboard/reports")
                      ? "bg-gray-900"
                      : "bg-transparent group-hover:bg-gray-800"
                  }
                `}
              />

              {/* CONTENT */}
              <div className="relative z-10 flex items-center gap-2 w-full">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-folder-plus" viewBox="0 0 16 16">
                                  <path d="m.5 3 .04.87a2 2 0 0 0-.342 1.311l.637 7A2 2 0 0 0 2.826 14H9v-1H2.826a1 1 0 0 1-.995-.91l-.637-7A1 1 0 0 1 2.19 4h11.62a1 1 0 0 1 .996 1.09L14.54 8h1.005l.256-2.819A2 2 0 0 0 13.81 3H9.828a2 2 0 0 1-1.414-.586l-.828-.828A2 2 0 0 0 6.172 1H2.5a2 2 0 0 0-2 2m5.672-1a1 1 0 0 1 .707.293L7.586 3H2.19q-.362.002-.683.12L1.5 2.98a1 1 0 0 1 1-.98z"/>
                                  <path d="M13.5 9a.5.5 0 0 1 .5.5V11h1.5a.5.5 0 1 1 0 1H14v1.5a.5.5 0 1 1-1 0V12h-1.5a.5.5 0 0 1 0-1H13V9.5a.5.5 0 0 1 .5-.5"/>
                                </svg>

                <span
                  className={`
                    transition-all duration-200
                    ${collapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"}
                  `}
                >
                  Reports
                </span>
              </div>
            </Link>
        </nav>

        {/* LOGOUT 
        <div className="p-4 border-t border-gray-800">
          <button
            onClick={() => {
              localStorage.removeItem("token");
              router.push("/login");
            }}
            className="w-full bg-red-600 hover:bg-red-700 py-2 rounded"
          >
            {collapsed ? "⎋" : "Logout"}
          </button>
        </div> */ }
      </aside>

      {/* MAIN */}
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">

        {/* HEADER */}
        <header className="h-20 bg-white border-b flex items-center justify-between px-6 py-11 transition-all duration-300">

            {/* 
          <h1 className="text-lg font-semibold text-gray-800">
            {pathname === "/dashboard"
              ? "Dashboard"
              : pathname.includes("reports")
              ? "Reports"
              : "System"}
          </h1> */}

          
          <div className="relative inline-block group">
            <button
              className="relative px-6 py-3 text-sm font-semibold text-white bg-gray-900/90 rounded-xl hover:bg-gray-700/90 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all duration-300 overflow-hidden cursor-pointer"
            >
              <div
                className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 blur-xl group-hover:opacity-75 transition-opacity"
              ></div>

              <span className="relative flex items-center gap-2">
                <svg
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  fill="none"
                  className="w-4 h-4"
                >
                  <path
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    stroke-width="2"
                    stroke-linejoin="round"
                    stroke-linecap="round"
                  ></path>
                </svg>
                Hover for Info
              </span>
            </button>

            <div
              className="absolute invisible opacity-0 group-hover:visible group-hover:opacity-100 top-full left-1/2 -translate-x-1/2 mb-3 w-72 transition-all duration-300 ease-out transform group-hover:translate-y-0 translate-y-2"
            >
              <div
                className="relative p-4 bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-md rounded-2xl border border-white/10 shadow-[0_0_30px_rgba(79,70,229,0.15)]"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div
                    className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-500/20"
                  >
                    <svg
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="w-4 h-4 text-indigo-400"
                    >
                      <path
                        clip-rule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        fill-rule="evenodd"
                      ></path>
                    </svg>
                  </div>
                  <h3 className="text-sm font-semibold text-white">Important Information</h3>
                </div>

                <div className="space-y-2">
                  <p className="text-sm text-gray-300">
                    This is just a reports monitoring system.
                  </p>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                      <path
                        clip-rule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        fill-rule="evenodd"
                      ></path>
                    </svg>
                    <span>Premium Feature</span>
                  </div>
                </div>

                <div
                  className="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-500/10 to-purple-500/10 blur-xl opacity-50"
                ></div>

                <div
                  className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-gradient-to-br from-gray-900/95 to-gray-800/95 rotate-45 border-r border-b border-white/10"
                ></div>
              </div>
            </div>
          </div>


          <div className="flex items-center gap-4 relative">

            {/* 🔔 NOTIFICATIONS */}
            <div ref={notifRef} className="relative">

              <button
                onClick={() => setShowNotif((prev) => !prev)}
                className="relative p-2 rounded-full cursor-pointer hover:bg-gray-100"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="black" className="bi bi-bell-fill" viewBox="0 0 16 16">
                  <path d="M8 16a2 2 0 0 0 2-2H6a2 2 0 0 0 2 2m.995-14.901a1 1 0 1 0-1.99 0A5 5 0 0 0 3 6c0 1.098-.5 6-2 7h14c-1.5-1-2-5.902-2-7 0-2.42-1.72-4.44-4.005-4.901"/>
                </svg>

                {upcoming.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs px-1.5 rounded-full">
                    {upcoming.length}
                  </span>
                )}
              </button>

              {showNotif && (
                <div className="absolute right-0 mt-2 w-80 bg-white border rounded-xl shadow-lg z-50">

                  <div className="p-3 border-b text-black font-semibold">
                    Upcoming Deadlines (2days)
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
                          className="p-3 border-b flex gap-1 items-center hover:bg-gray-50"
                        >
                          <p className="text-sm text-black font-medium">
                            {r.report_name} :
                          </p>
                          
                          <p className="text-xs text-red-600">
                            Due:{" "}
                            {new Date(r.deadline).toLocaleDateString()}
                          </p>
                        </div>
                      ))
                    )}

                  </div>
                </div>
              )}
            </div>

            {/* 👤 PROFILE */}
            <div ref={profileRef} className="relative">

              <button
                onClick={() => setShowProfile((prev) => !prev)}
                className="flex items-center gap-3 px-3 py-2 cursor-pointer rounded-full bg-gray-100 hover:bg-gray-200 transition-all duration-200"
              >
                {/* AVATAR */}
                <div className="w-9 h-9 rounded-full overflow-hidden bg-gray-200 shadow-lg cursor-pointer hover:scale-105 transition">
                  
                  {preview || user.avatar ? (
                      <img src={preview || user.avatar} className="w-full h-full object-cover" />
                  ) : (
                      <div className="w-full h-full flex items-center justify-center bg-black text-white text-2xl font-bold">
                      {user.username?.charAt(0)?.toUpperCase()}
                      </div>
                  )}

                </div>

                

                {/* TEXT */}
                <div className="text-left leading-tight">
                  <p className="text-sm text-gray-800">
                    {user?.full_name || "Welcome"}
                  </p>
                  <p className="text-xs text-gray-500">
                    @{user?.username || "loading..."}
                  </p>
                </div>

                {/* ROLE */}
                <p className={`text-xs font-semibold px-2 py-1 rounded-md ${roleColor}`}>
                  {user?.role || "User"}
                </p>

                {/* ARROW */}
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
                <div className="absolute right-0 mt-2 w-48 bg-white border rounded-xl shadow-lg z-50">

                  <button
                    onClick={() => {
                      setShowProfile(false);
                      router.push("/dashboard/profile");
                    }}
                    className="w-full text-left px-4 py-2 text-black hover:bg-gray-100"
                  >
                    Profile
                  </button>

                  <button
                    onClick={() => {
                      setShowProfile(false);
                      router.push("/dashboard/settings");
                    }}
                    className="w-full text-left px-4 py-2 text-black hover:bg-gray-100"
                  >
                    Settings
                  </button>

                  <button
                    onClick={() => {
                      localStorage.removeItem("token");
                      router.push("/login");
                    }}
                    className="w-full text-left px-4 py-2  cursor-pointer text-red-600 hover:bg-gray-100"
                  >
                    Logout
                  </button>

                </div>
              )}

            </div>

          </div>
        </header>

        {/* CONTENT */}
        <main className="flex-1 overflow-y-auto p-8 transition-all duration-300">
          {children}
        </main>

      </div>
    </div>
  );
}