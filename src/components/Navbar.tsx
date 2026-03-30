"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-[var(--color-border)] h-20">
      <div className="max-w-[1320px] mx-auto px-10 h-full flex items-center justify-between">
        <Link href="/">
          <Image
            src="/images/logo.avif"
            alt="Smoove Skin Studio"
            width={120}
            height={48}
            className="h-12 w-auto"
            priority
          />
        </Link>

        <ul
          className={`${
            menuOpen ? "flex" : "hidden"
          } md:flex gap-10 md:static absolute top-20 left-0 right-0 md:flex-row flex-col bg-white md:bg-transparent p-5 md:p-0 border-b md:border-0 border-[var(--color-border)] shadow-lg md:shadow-none`}
        >
          <li>
            <a
              href="#services"
              onClick={closeMenu}
              className="text-[0.938rem] font-normal text-[var(--color-text)] hover:text-[var(--color-primary)] transition-colors tracking-[0.01em]"
            >
              Services
            </a>
          </li>
          <li>
            <a
              href="#about"
              onClick={closeMenu}
              className="text-[0.938rem] font-normal text-[var(--color-text)] hover:text-[var(--color-primary)] transition-colors tracking-[0.01em]"
            >
              About
            </a>
          </li>
          <li>
            <a
              href="#reviews"
              onClick={closeMenu}
              className="text-[0.938rem] font-normal text-[var(--color-text)] hover:text-[var(--color-primary)] transition-colors tracking-[0.01em]"
            >
              Reviews
            </a>
          </li>
          <li>
            <a
              href="#contact"
              onClick={closeMenu}
              className="text-[0.938rem] font-normal text-[var(--color-text)] hover:text-[var(--color-primary)] transition-colors tracking-[0.01em]"
            >
              Contact
            </a>
          </li>
        </ul>

        <a
          href="#book"
          className="hidden md:inline-flex items-center justify-center px-7 py-3 rounded-lg bg-[var(--color-primary)] text-white text-sm font-medium tracking-[0.01em] hover:bg-[var(--color-primary-dark)] transition-colors"
        >
          Book Now
        </a>

        <button
          className="flex md:hidden flex-col gap-[5px] bg-transparent border-none cursor-pointer p-1"
          aria-label="Toggle menu"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span
            className={`block w-6 h-0.5 bg-[var(--color-text)] transition-all ${
              menuOpen ? "rotate-45 translate-y-[7px]" : ""
            }`}
          />
          <span
            className={`block w-6 h-0.5 bg-[var(--color-text)] transition-all ${
              menuOpen ? "opacity-0" : ""
            }`}
          />
          <span
            className={`block w-6 h-0.5 bg-[var(--color-text)] transition-all ${
              menuOpen ? "-rotate-45 -translate-y-[7px]" : ""
            }`}
          />
        </button>
      </div>
    </nav>
  );
}
