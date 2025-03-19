import { useEffect } from 'react';
import { Link } from 'wouter';
import { scrollToTop } from '@/lib/utils';

const Sitemap = () => {
  useEffect(() => {
    scrollToTop();
    document.title = 'Sitemap - ARCEM';
  }, []);

  return (
    <div className="bg-white py-32">
      <div className="container mx-auto px-4 md:px-8">
        <h1 className="text-4xl font-montserrat font-bold mb-8">Sitemap</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {/* Main Pages */}
          <div>
            <h2 className="text-2xl font-montserrat font-bold mb-4 text-[#1E90DB]">Main Pages</h2>
            <ul className="space-y-3">
              <li>
                <Link href="/" className="text-gray-700 hover:text-[#1E90DB] transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-700 hover:text-[#1E90DB] transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/services" className="text-gray-700 hover:text-[#1E90DB] transition-colors">
                  Services
                </Link>
              </li>
              <li>
                <Link href="/projects" className="text-gray-700 hover:text-[#1E90DB] transition-colors">
                  Projects
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-gray-700 hover:text-[#1E90DB] transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/testimonials" className="text-gray-700 hover:text-[#1E90DB] transition-colors">
                  Testimonials
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-700 hover:text-[#1E90DB] transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/join-us" className="text-gray-700 hover:text-[#1E90DB] transition-colors">
                  Join Our Team
                </Link>
              </li>
              <li>
                <Link href="/request-quote" className="text-gray-700 hover:text-[#1E90DB] transition-colors">
                  Request a Quote
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Services */}
          <div>
            <h2 className="text-2xl font-montserrat font-bold mb-4 text-[#1E90DB]">Our Services</h2>
            <ul className="space-y-3">
              <li>
                <Link href="/services" className="text-gray-700 hover:text-[#1E90DB] transition-colors">
                  Commercial Construction
                </Link>
              </li>
              <li>
                <Link href="/services" className="text-gray-700 hover:text-[#1E90DB] transition-colors">
                  Residential Construction
                </Link>
              </li>
              <li>
                <Link href="/services" className="text-gray-700 hover:text-[#1E90DB] transition-colors">
                  Renovation & Remodeling
                </Link>
              </li>
              <li>
                <Link href="/services" className="text-gray-700 hover:text-[#1E90DB] transition-colors">
                  Project Planning & Design
                </Link>
              </li>
              <li>
                <Link href="/services" className="text-gray-700 hover:text-[#1E90DB] transition-colors">
                  Industrial Construction
                </Link>
              </li>
              <li>
                <Link href="/services" className="text-gray-700 hover:text-[#1E90DB] transition-colors">
                  Construction Management
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Legal & Info */}
          <div>
            <h2 className="text-2xl font-montserrat font-bold mb-4 text-[#1E90DB]">Legal & Info</h2>
            <ul className="space-y-3">
              <li>
                <Link href="/privacy-policy" className="text-gray-700 hover:text-[#1E90DB] transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms-of-service" className="text-gray-700 hover:text-[#1E90DB] transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/sitemap" className="text-gray-700 hover:text-[#1E90DB] transition-colors">
                  Sitemap
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Admin */}
          <div>
            <h2 className="text-2xl font-montserrat font-bold mb-4 text-[#1E90DB]">Admin</h2>
            <ul className="space-y-3">
              <li>
                <Link href="/auth" className="text-gray-700 hover:text-[#1E90DB] transition-colors">
                  Login
                </Link>
              </li>
              <li>
                <Link href="/admin" className="text-gray-700 hover:text-[#1E90DB] transition-colors">
                  Admin Dashboard
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sitemap;