"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "Dashboard" },
  { href: "/data-log", label: "Data Log" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <>
      <nav className="bottom-nav" role="navigation" aria-label="Main navigation">
        <div className="pill-group">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`pill ${isActive ? "pill-active" : "pill-inactive"}`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      <style jsx>{`
        .bottom-nav {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          height: 68px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(10, 10, 16, 0.95);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-top: 1px solid rgba(255, 255, 255, 0.07);
          box-shadow: 0 -4px 24px rgba(0, 0, 0, 0.5);
          z-index: 100;
        }

        .pill-group {
          display: flex;
          gap: 12px;
          align-items: center;
        }

        .pill {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          height: 42px;
          padding: 0 36px;
          border-radius: 999px;
          font-size: 14px;
          font-weight: 600;
          letter-spacing: 0.02em;
          text-decoration: none;
          transition: all 0.18s ease;
          white-space: nowrap;
          border: none;
        }

        .pill-active {
          background: #4f6ef7;
          color: #ffffff;
          box-shadow: 0 2px 14px rgba(79, 110, 247, 0.45);
        }

        .pill-active:hover {
          background: #3d5ae5;
          box-shadow: 0 4px 20px rgba(79, 110, 247, 0.55);
          transform: translateY(-1px);
        }

        .pill-inactive {
          background: rgba(79, 110, 247, 0.18);
          color: #7b97ff;
          border: none;
        }

        .pill-inactive:hover {
          background: rgba(79, 110, 247, 0.28);
          color: #a0b8ff;
          transform: translateY(-1px);
        }
      `}</style>
    </>
  );
}
