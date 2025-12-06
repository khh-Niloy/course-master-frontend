"use client";

import Link from "next/link";
import Image from "next/image";
import { Instagram, Linkedin, Phone, Mail, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100">
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Center-aligned layout */}
        <div className="flex flex-col items-center">
          {/* Logo Section - Middle */}
          <div className="flex flex-col items-center mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Link href="/" className="flex items-center gap-3 group cursor-pointer">
                <Image
                  src="/logo-icon.svg"
                  alt="Course Master Logo"
                  width={48}
                  height={48}
                  className="w-12 h-12"
                />
                <div className="flex flex-col">
                  <span className="font-bold text-gray-900 text-lg leading-tight">Course</span>
                  <span className="text-gray-600 text-sm leading-tight font-medium">Master</span>
                </div>
              </Link>
            </div>
            <p className="text-sm text-gray-600 text-center max-w-md mb-4">
              Your trusted platform for quality online courses and educational content.
            </p>
            <div className="flex items-center gap-3">
              <Link
                href="https://www.facebook.com"
                className="w-9 h-9 rounded-xl border border-gray-200 hover:border-[#1FB67A] hover:bg-[#1FB67A]/5 text-gray-600 hover:text-[#1FB67A] flex items-center justify-center transition-colors cursor-pointer"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                    clipRule="evenodd"
                  />
                </svg>
              </Link>
              <Link
                href="https://www.instagram.com"
                className="w-9 h-9 rounded-xl border border-gray-200 hover:border-[#1FB67A] hover:bg-[#1FB67A]/5 text-gray-600 hover:text-[#1FB67A] flex items-center justify-center transition-colors cursor-pointer"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Instagram className="w-5 h-5" />
              </Link>
              <Link
                href="https://www.linkedin.com"
                className="w-9 h-9 rounded-xl border border-gray-200 hover:border-[#1FB67A] hover:bg-[#1FB67A]/5 text-gray-600 hover:text-[#1FB67A] flex items-center justify-center transition-colors cursor-pointer"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Linkedin className="w-5 h-5" />
              </Link>
            </div>
          </div>

          {/* Location, Contact, and Navigation - Below Logo */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 w-full max-w-4xl">
            {/* Location */}
            <div>
              <h3 className="text-gray-900 font-semibold mb-3">Location</h3>
              <div className="space-y-4 text-sm">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-[#1FB67A] mt-0.5 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-gray-900 font-medium break-words">
                      Online Learning Platform
                    </p>
                    <p className="text-sm text-gray-500 break-words">
                      Access courses from anywhere, anytime
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-gray-900 font-semibold mb-3">Contact</h3>
              <div className="space-y-4 text-sm">
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-[#1FB67A] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-500">Phone Number</p>
                    <span className="text-sm text-gray-900">+1 (555) 123-4567</span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-[#1FB67A] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-500">Email Address</p>
                    <span className="text-sm text-gray-900">support@coursemaster.com</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div>
              <h3 className="text-gray-900 font-semibold mb-3">Navigation</h3>
              <nav className="flex flex-col gap-2 text-sm">
                <Link
                  href="/"
                  className="text-gray-600 hover:text-[#1FB67A] hover:underline hover:font-semibold transition-colors cursor-pointer"
                >
                  Home
                </Link>
                <Link
                  href="/all-courses"
                  className="text-gray-600 hover:text-[#1FB67A] hover:underline hover:font-semibold transition-colors cursor-pointer"
                >
                  All Courses
                </Link>
                <Link
                  href="/dashboard"
                  className="text-gray-600 hover:text-[#1FB67A] hover:underline hover:font-semibold transition-colors cursor-pointer"
                >
                  Dashboard
                </Link>
                <Link
                  href="/login"
                  className="text-gray-600 hover:text-[#1FB67A] hover:underline hover:font-semibold transition-colors cursor-pointer"
                >
                  Login
                </Link>
                <a
                  href="mailto:support@coursemaster.com"
                  className="text-gray-600 hover:text-[#1FB67A] hover:underline hover:font-semibold transition-colors cursor-pointer"
                >
                  Contact us
                </a>
              </nav>
            </div>
          </div>
        </div>


        {/* Bottom */}
        <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center sm:items-center justify-between gap-4 text-sm text-gray-500">
          <p className="text-xs sm:text-sm text-center sm:text-left">
            © {new Date().getFullYear()} Course Master. All rights reserved.
          </p>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-center sm:text-left">
            <span>Support:</span>
            <a
              href="mailto:support@coursemaster.com"
              className="text-gray-500 hover:text-[#1FB67A] transition-colors break-all sm:break-normal"
            >
              support@coursemaster.com
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
