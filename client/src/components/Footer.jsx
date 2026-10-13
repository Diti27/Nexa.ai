import React from 'react'
import { assets } from '../assets/assets'

const Footer = () => {
  return (
    <footer className="px-6 md:px-16 lg:px-24 xl:px-32 pt-8 w-full text-gray-500">
      <div className="flex flex-col md:flex-row justify-between w-full gap-10 border-b border-gray-500/30 pb-6">

        {/* Left Section */}
        <div className="md:max-w-96">
          <img
            className="h-10"
            src={assets.logo}
            alt="Quick.ai Logo"
          />

          <p className="mt-6 text-sm leading-6">
            Experience the power of AI with Quick.ai.
            <br />
            Transform your content creation with our suite of premium AI
            tools. Write articles, generate images, and enhance your
            workflow.
          </p>
        </div>

        {/* Right Section */}
        <div className="flex-1 flex flex-col sm:flex-row items-start md:justify-end gap-16">

          {/* Company Links */}
          <div>
            <h2 className="font-semibold mb-5 text-gray-800">
              Company
            </h2>

            <ul className="text-sm space-y-2">
              <li>
                <a href="#" className="hover:text-primary">
                  Home
                </a>
              </li>

              <li>
                <a href="#" className="hover:text-primary">
                  About Us
                </a>
              </li>

              <li>
                <a href="#" className="hover:text-primary">
                  Contact Us
                </a>
              </li>

              <li>
                <a href="#" className="hover:text-primary">
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h2 className="font-semibold text-gray-800 mb-5">
              Subscribe to our newsletter
            </h2>

            <p className="text-sm max-w-sm">
              The latest news, articles, and resources sent directly to your
              inbox every week.
            </p>

            <div className="flex items-center gap-2 pt-4">
              <input
                type="email"
                placeholder="Enter your email"
                className="border border-gray-300 placeholder-gray-500 outline-none focus:ring-2 focus:ring-indigo-600 rounded px-3 h-10 w-full max-w-64"
              />

              <button className="bg-primary hover:bg-blue-700 text-white px-5 h-10 rounded transition cursor-pointer">
                Subscribe
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Copyright */}
      <p className="pt-5 text-center text-xs md:text-sm">
        Copyright 2026 © <span className="font-semibold">GreatStack</span>. All Rights
        Reserved.
      </p>
    </footer>
  )
}

export default Footer