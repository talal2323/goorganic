'use client'

import React from 'react';
import Link from 'next/link';
import { useAppContext } from '@/context/AppContext';
import { Logo, Icon } from '@/components/common/UIComponents'; // Import the Logo component & Icon for social logos

const Footer = () => {
  const { dispatch } = useAppContext();

  // Link data based on the screenshot
  const shopLinks = [
    { name: 'All Products', href: '/shop' },
    { name: 'Food & Beverages', href: '/shop' },
    { name: 'Personal Care & Wellness', href: '/shop' },
    { name: 'Supplements & Functional Nutrition', href: '/shop' }
  ];

  const supportLinks = [
    { name: 'Contact Us', href: '/contact' },
    { name: 'FAQ', href: '/contact' } // FAQ is on the Contact page
  ];

  const companyLinks = [
    { name: 'About Us', href: '/about' },
    { name: 'Blog', href: '/blog' }
  ];

  const socialLinks = [
    {
      name: 'Facebook',
      href: '',
      path: 'M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3V2z'
    },
    {
      name: 'Instagram',
      href: '',
      path: 'M7.75 2h8.5A5.75 5.75 0 0122 7.75v8.5A5.75 5.75 0 0116.25 22h-8.5A5.75 5.75 0 012 16.25v-8.5A5.75 5.75 0 017.75 2zm0 2A3.75 3.75 0 004 7.75v8.5A3.75 3.75 0 007.75 20h8.5A3.75 3.75 0 0020 16.25v-8.5A3.75 3.75 0 0016.25 4h-8.5zm8.75 1.25a1 1 0 110 2 1 1 0 010-2zM12 8a4 4 0 110 8 4 4 0 010-8z'
    }
  ];

  return (
    <footer className="bg-black text-gray-300 w-full overflow-x-hidden">
      <div className="container mx-auto px-4 py-12 max-w-full">
        {/* 4-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

          {/* Column 1: Logo, Tagline, Social */}
          <div className="lg:col-span-1">
            <Link href="/">
              <Logo src="/images/logo.png" alt="GOorganic" className="h-10 cursor-pointer" />
            </Link>
            <p className="text-sm mt-4 text-gray-400">
              Connecting you with the best organic products from verified vendors.
            </p>
            <div className="flex space-x-4 mt-4">
              {socialLinks.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  aria-label={item.name}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors"
                >
                  <Icon path={item.path} className="w-5 h-5 text-gray-300 hover:text-white" />
                </a>
              ))}
            </div>
          </div>

          {/* Column 2: Shop Links */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Shop</h3>
            <ul className="space-y-3">
              {shopLinks.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm hover:text-white"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Support Links */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Support</h3>
            <ul className="space-y-3">
              {supportLinks.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm hover:text-white"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Company Links */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Company</h3>
            <ul className="space-y-3">
              {companyLinks.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm hover:text-white"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-gray-700">
          <div className="text-center">
            <p className="text-sm text-gray-500">
              © 2025 GOorganic. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;