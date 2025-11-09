import React from 'react';
import { useAppContext } from '../../context/AppContext';

const Footer = () => {
  const { dispatch } = useAppContext();

  const navigation = {
    main: [
      { name: 'About Us', page: 'About' },
      { name: 'Contact', page: 'Contact' },
      { name: 'Privacy Policy', page: 'PrivacyPolicy' },
      { name: 'Terms & Conditions', page: 'TermsConditions' },
    ],
    social: [
      { name: 'Facebook', href: '#', icon: 'facebook' },
      { name: 'Instagram', href: '#', icon: 'instagram' },
      { name: 'Twitter', href: '#', icon: 'twitter' },
    ],
  };

  return (
    <footer className="bg-[#175017] text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4">About Go Organic</h3>
            <p className="text-green-100 text-sm">
              Your trusted marketplace for certified organic products. 
              Supporting local farmers and promoting sustainable agriculture.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {navigation.main.map((item) => (
                <li key={item.name}>
                  <button
                    onClick={() => dispatch({ type: 'SET_PAGE', payload: item.page })}
                    className="text-green-100 hover:text-white text-sm"
                  >
                    {item.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <div className="space-y-2 text-sm text-green-100">
              <p>123 Organic Street</p>
              <p>Green City, EC 12345</p>
              <p>Phone: +123 456 7890</p>
              <p>Email: info@goorganic.com</p>
            </div>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Newsletter</h3>
            <p className="text-green-100 text-sm mb-4">
              Subscribe to our newsletter for updates and special offers.
            </p>
            <form className="space-y-2">
              <input
                type="email"
                placeholder="Your email address"
                className="w-full px-3 py-2 text-gray-900 rounded"
              />
              <button
                type="submit"
                className="w-full bg-white text-[#175017] px-4 py-2 rounded hover:bg-green-100 transition-colors"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-green-800">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-green-100">
              © {new Date().getFullYear()} Go Organic. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              {navigation.social.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-green-100 hover:text-white"
                >
                  <span className="sr-only">{item.name}</span>
                  {item.name}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;