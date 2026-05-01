import { Link } from 'react-router';

export function Footer() {
  return (
    <footer className="bg-[#0d0d0d] border-t border-gray-900 py-12">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* About Us */}
          <div>
            <h3 className="text-white font-bold mb-4">About Us</h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              GastroFlow delivers premium dining experiences with carefully curated menus and exceptional service.
            </p>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-bold mb-4">Contact</h3>
            <ul className="space-y-2 text-gray-500 text-sm">
              <li>Email: info@gastroflow.md</li>
              <li>Phone: +373 22 123 456</li>
              <li>Address: Chisinau, Moldova</li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <a href="#reservation" className="text-gray-500 hover:text-white text-sm transition-colors">
                  Reservation
                </a>
              </li>
              <li>
                <a href="#order" className="text-gray-500 hover:text-white text-sm transition-colors">
                  Order Online
                </a>
              </li>
              <li>
                <a href="#menu" className="text-gray-500 hover:text-white text-sm transition-colors">
                  Menu
                </a>
              </li>
              <li>
                <a href="#career" className="text-gray-500 hover:text-white text-sm transition-colors">
                  Career
                </a>
              </li>
              <li>
                <Link to="/feedback" className="text-gray-500 hover:text-white text-sm transition-colors">
                  Feedback
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-white font-bold mb-4">Terms</h3>
            <ul className="space-y-2">
              <li>
                <a href="#privacy" className="text-gray-500 hover:text-white text-sm transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#terms" className="text-gray-500 hover:text-white text-sm transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <Link to="/feedback" className="text-gray-500 hover:text-white text-sm transition-colors">
                  Feedback
                </Link>
              </li>
              <li>
                <a href="#cookies" className="text-gray-500 hover:text-white text-sm transition-colors">
                  Cookie Policy
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-8 border-t border-gray-900 text-center">
          <p className="text-gray-600 text-sm">
            © 2026 GastroFlow. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
