import React from 'react';
import { 
  Twitter, 
  Instagram, 
  Linkedin,
  Mail, 
  Copyright 
} from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand and Tagline */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
            <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 100 100" 
                  className="h-8 w-8 text-indigo-600 dark:text-indigo-400"
                  aria-hidden="true"
                >
                  <circle cx="50" cy="50" r="48" fill="url(#forgeGradient)"/>
                  <defs>
                    <linearGradient id="forgeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#4A90E2" stopOpacity="1"/>
                      <stop offset="100%" stopColor="#6D41A3" stopOpacity="1"/>
                    </linearGradient>
                  </defs>
                  <path d="M30 55 Q50 35, 70 55" fill="none" stroke="white" strokeWidth="4"/>
                  <path d="M30 55 L20 45 Q15 40, 25 35 Q35 30, 40 35" fill="none" stroke="white" strokeWidth="4"/>
                  <path d="M70 55 L80 45 Q85 40, 75 35 Q65 30, 60 35" fill="none" stroke="white" strokeWidth="4"/>
                  <circle cx="50" cy="55" r="8" fill="white"/>
                  <path d="M40 70 Q50 80, 60 70" fill="none" stroke="white" strokeWidth="3"/>
                </svg>
              <span className="text-xl font-bold text-gray-900 dark:text-gray-100">
                DreamForge
              </span>
            </div>
            <p className="text-gray-600 text-left dark:text-gray-400 mb-4">
              Connecting creative talents with passionate patrons. Your dream project starts here.
            </p>
            <div className="flex space-x-4">
              <a 
                href="https://twitter.com/puneethk67" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-gray-600 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400"
              >
                <Twitter className="w-6 h-6" />
              </a>
              <a 
                href="https://instagram.com/puneeth._67" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-gray-600 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400"
              >
                <Instagram className="w-6 h-6" />
              </a>
              <a 
                href="https://www.linkedin.com/in/puneeth-kumar-386a22224/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-gray-600 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400"
              >
                <Linkedin className="w-6 h-6" />
              </a>         
              </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <a 
                  href="/about" 
                  className="text-gray-600 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 transition-colors"
                >
                  About Us
                </a>
              </li>
              <li>
                <a 
                  href="/faq" 
                  className="text-gray-600 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 transition-colors"
                >
                  FAQ
                </a>
              </li>
              <li>
                <a 
                  href="/terms" 
                  className="text-gray-600 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 transition-colors"
                >
                  Terms of Service
                </a>
              </li>
              <li>
                <a 
                  href="/privacy" 
                  className="text-gray-600 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 transition-colors"
                >
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Contact Us</h4>
            <div className="space-y-4">
              <div className="flex justify-center items-center space-x-3">
                <Mail className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <a 
                  href="mailto:uplift.ai.tech@gmail.com" 
                  className="text-gray-600 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 transition-colors"
                >
                  uplift.ai.tech@gmail.com
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-800 text-center">
          <p className="flex items-center justify-center text-gray-600 dark:text-gray-400">
            <Copyright className="w-4 h-4 mr-2" />
            {currentYear} DreamForge. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;