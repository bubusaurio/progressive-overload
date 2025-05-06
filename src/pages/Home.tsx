import { Link } from "react-router-dom";
import styled from "styled-components";
import Button from "../components/Button";

import {
  ArrowRight,
  BarChart2,
  CheckCircle,
  Dumbbell,
  MessageCircle,
  Smartphone,
} from "lucide-react";

const MinimalLandingPage = () => {
  return (
    <div className="min-h-screen flex flex-col text-gray-800">
      {/* Hero Section */}
      <header className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
        <div className="container mx-auto px-6 py-16">
          <nav className="flex justify-between items-center mb-16">
            <div className="flex items-center space-x-2">
              <Dumbbell size={28} className="text-white" />
              <span className="font-bold text-xl">ProgressPro</span>
            </div>
            <div className="hidden md:flex space-x-6">
              <a href="#features" className="hover:text-blue-200 transition">
                Features
              </a>
              <a href="#about" className="hover:text-blue-200 transition">
                About
              </a>
              <a href="#faq" className="hover:text-blue-200 transition">
                FAQ
              </a>
            </div>
            <div className="flex space-x-4">
              <Link
                to="/login"
                className="px-4 py-2 rounded text-gray-800 bg-white hover:bg-blue-100 transition"
              >
                Log In
              </Link>
              <Link
                to="/signup"
                className="px-4 py-2 rounded bg-indigo-800 hover:bg-indigo-900 transition"
              >
                Signup
              </Link>
            </div>
          </nav>

          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Track. Progress. Succeed.
              </h1>
              <p className="text-xl mb-8">
                The smartest way to track your progressive overload and
                consistently build strength.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Link
                  to="/login"
                  className="px-6 py-3 bg-white text-indigo-600 rounded-lg font-medium hover:bg-gray-100 transition flex items-center justify-center"
                >
                  Get Started <ArrowRight size={18} className="ml-2" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-5 bg-gradient-to-r from-blue-500 to-indigo-600im text-white">
      <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold ">
            Optimize Your Training
          </h2>
        </div>
      </section>
      <section
        id="features"
        className="py-10 bg-[url('./img/fitness_bg.jpg')] bg-cover bg-center bg-no-repeat"
      >
        <div className="container mx-auto px-6">
          <div className="text-center mb-16"></div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
              <BarChart2 size={40} className="text-indigo-600 mb-6" />
              <h3 className="text-xl font-bold mb-3">
                Smart Progress Tracking
              </h3>
              <p className="text-gray-600">
                Automatically track your progression across weights, reps, sets,
                and volume to ensure you're always improving.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
              <CheckCircle size={40} className="text-indigo-600 mb-6" />
              <h3 className="text-xl font-bold mb-3">Personal Records</h3>
              <p className="text-gray-600">
                Celebrate your achievements with automatic PR tracking and
                insightful progress visualizations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-indigo-600 text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-6">
            Ready to Transform Your Training?
          </h2>
          <Link
            to="/signup"
            className="px-8 py-4 bg-white text-indigo-600 rounded-lg font-medium hover:bg-gray-100 transition"
          >
            Signup Now
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-300 py-12">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Dumbbell size={24} className="text-indigo-400" />
                <span className="font-bold text-white text-lg">
                  ProgressPro
                </span>
              </div>
              <p className="mb-4">
                The smart fitness application for progressive overload training.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="hover:text-white transition">
                  <span className="sr-only">Twitter</span>
                  <svg
                    className="h-6 w-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a href="#" className="hover:text-white transition">
                  <span className="sr-only">Instagram</span>
                  <svg
                    className="h-6 w-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
              </div>
            </div>

            <div>
              <h3 className="text-white font-bold mb-4">Features</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="hover:text-white transition">
                    Progress Tracking
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Workout Templates
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Analytics
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Community
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-bold mb-4">Company</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="hover:text-white transition">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Terms
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-700 mt-10 pt-6 text-sm text-center">
            <p>&copy; 2025 ProgressPro. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MinimalLandingPage;
