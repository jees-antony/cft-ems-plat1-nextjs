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
          bottom: 16px;
          left: 0;
          right: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          z-index: 100;
          pointer-events: none;
        }

        .pill-group {
          display: flex;
          gap: 12px;
          align-items: center;
          pointer-events: auto;
        }

        .pill {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          height: 48px;
          padding: 0 32px;
          border-radius: 20px;
          font-size: 15px;
          font-weight: 600;
          letter-spacing: 0.02em;
          text-decoration: none;
          transition: all 0.2s ease;
          white-space: nowrap;
          border: none;
          cursor: pointer;
          box-shadow: 0 8px 24px rgba(79, 110, 247, 0.3);
        }

        .pill-active {
          background: linear-gradient(135deg, #4f6ef7, #3d5ae5);
          color: #ffffff;
          box-shadow: 0 8px 28px rgba(79, 110, 247, 0.45);
        }

        .pill-active:hover {
          background: linear-gradient(135deg, #5a78ff, #4866f0);
          transform: translateY(-2px);
          box-shadow: 0 12px 32px rgba(79, 110, 247, 0.55);
        }

        .pill-inactive {
          background: linear-gradient(135deg, rgba(79, 110, 247, 0.6), rgba(79, 110, 247, 0.45));
          color: #ffffff;
          box-shadow: 0 8px 24px rgba(79, 110, 247, 0.25);
        }

        .pill-inactive:hover {
          background: linear-gradient(135deg, rgba(79, 110, 247, 0.75), rgba(79, 110, 247, 0.6));
          color: #ffffff;
          transform: translateY(-2px);
          box-shadow: 0 12px 32px rgba(79, 110, 247, 0.4);
        }
      `}</style>
    </>
  );
}
