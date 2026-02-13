'use client'

import React from 'react';
import Link from 'next/link';
import { useAppContext } from '@/context/AppContext';
import { Logo, Icon } from '@/components/common/UIComponents'; // Import the Logo component & Icon for social logos

const Footer = () => {
  const { dispatch } = useAppContext();

  const shopLinks = [
    { name: 'All Products', href: '/shop' },
    { name: 'Food & Beverages', href: '/shop?category=food' },
    { name: 'Personal Care & Wellness', href: '/shop?category=personal-care' },
    { name: 'Supplements & Functional Nutrition', href: '/shop?category=supplements' }
  ];

  const supportLinks = [
    { name: 'Contact Us', href: '/contact' },
    { name: 'FAQ', href: '/contact' }
  ];

  const companyLinks = [
    { name: 'About Us', href: '/about' },
    { name: 'Blog', href: '/blog' }
  ];

  const legalLinks = [
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Terms & Conditions', href: '/terms' },
    { name: 'Return Policy', href: '/return-policy' },
    { name: 'Refund Policy', href: '/refund-policy' },
    { name: 'Shipping Policy', href: '/shipping-policy' }
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
      <div className="container mx-auto py-12">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-12 gap-8 px-4 sm:px-6 lg:px-8">

          {/* Column 1: Logo & Tagline */}
          <div className="md:col-span-4 lg:col-span-3 -ml-4 sm:-ml-6 lg:-ml-8 pl-4 sm:pl-6 lg:pl-8">
            <Link href="/" className="inline-block">
              <Logo src="/images/logo.png" alt="GOorganic" className="h-10 cursor-pointer mb-4" />
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed mb-6">
              Connecting you with the best organic products from verified vendors.
            </p>
            <div className="flex space-x-4">
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

          {/* Column 2: Shop */}
          <div className="lg:col-span-2">
            <h3 className="text-lg font-semibold text-white mb-4">Shop</h3>
            <ul className="space-y-3">
              {shopLinks.map((item) => (
                <li key={item.name}>
                  <Link href={item.href} className="text-sm hover:text-white">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Support */}
          <div className="lg:col-span-2">
            <h3 className="text-lg font-semibold text-white mb-4">Support</h3>
            <ul className="space-y-3">
              {supportLinks.map((item) => (
                <li key={item.name}>
                  <Link href={item.href} className="text-sm hover:text-white">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Company */}
          <div className="lg:col-span-2">
            <h3 className="text-lg font-semibold text-white mb-4">Company</h3>
            <ul className="space-y-3">
              {companyLinks.map((item) => (
                <li key={item.name}>
                  <Link href={item.href} className="text-sm hover:text-white">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 5: Legal */}
          <div className="lg:col-span-3">
            <h3 className="text-lg font-semibold text-white mb-4">Legal</h3>
            <ul className="space-y-3">
              {legalLinks.map((item) => (
                <li key={item.name}>
                  <Link href={item.href} className="text-sm hover:text-white">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-gray-700 text-center">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} GOorganic. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;