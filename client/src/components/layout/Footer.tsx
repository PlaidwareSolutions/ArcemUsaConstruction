import { Link } from "wouter";
import {
  Facebook,
  Github,
  Instagram,
  Linkedin,
  MapPin,
  Phone,
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import NewsletterSubscription from "@/components/common/NewsletterSubscription";

const Footer = () => {
  return (
    <footer className="bg-black text-white pt-20 pb-8">
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div>
            <Link
              href="/"
              className="text-white text-2xl font-montserrat font-bold mb-6 inline-block"
            >
              ARCEM
            </Link>
            <p className="text-gray-400 mb-6 leading-relaxed">
              Premier construction company delivering exceptional quality and
              innovative solutions for over a decade.
            </p>
            <div className="flex space-x-4 mb-6">
              <a
                href="#"
                className="text-gray-400 hover:text-[#1E90DB] transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-[#1E90DB] transition-colors"
                aria-label="GitHub"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-[#1E90DB] transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-[#1E90DB] transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </a>
            </div>

            {/* Contact Info with Icons */}
            <div className="space-y-3 text-gray-400">
              <div className="flex items-center space-x-3">
                <MapPin className="w-4 h-4 text-[#1E90DB]" />
                <span className="text-sm">
                  215 Birch Hill Dr, Sugar Land, TX 77479
                </span>
              </div>
              <div className="flex items-start space-x-3">
                <Phone className="w-4 h-4 text-[#1E90DB] mt-1" />
                <div>
                  <div className="text-sm">Cell: (713) 624-0083</div>
                  <div className="text-sm">Office: (713) 624-0313</div>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Mail className="w-4 h-4 text-[#1E90DB] mt-1" />
                <div>
                  <div className="text-sm">aj@arcemusa.com</div>
                  <div className="text-sm">admin@arcemusa.com</div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h5 className="text-white font-montserrat font-bold mb-6">
              Quick Links
            </h5>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/"
                  className="text-gray-400 hover:text-[#1E90DB] transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-gray-400 hover:text-[#1E90DB] transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/services"
                  className="text-gray-400 hover:text-[#1E90DB] transition-colors"
                >
                  Services
                </Link>
              </li>
              <li>
                <Link
                  href="/projects"
                  className="text-gray-400 hover:text-[#1E90DB] transition-colors"
                >
                  Projects
                </Link>
              </li>
              <li>
                <Link
                  href="/careers"
                  className="text-gray-400 hover:text-[#1E90DB] transition-colors"
                >
                  Careers
                </Link>
              </li>
              <li>
                <Link
                  href="/join-us"
                  className="text-gray-400 hover:text-[#1E90DB] transition-colors"
                >
                  Join Us
                </Link>
              </li>
              <li>
                <Link
                  href="/resources"
                  className="text-gray-400 hover:text-[#1E90DB] transition-colors"
                >
                  Resources
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="text-gray-400 hover:text-[#1E90DB] transition-colors"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-gray-400 hover:text-[#1E90DB] transition-colors"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h5 className="text-white font-montserrat font-bold mb-6">
              Our Services
            </h5>
            <ul className="space-y-3">
              <li>
                <a
                  href="/services"
                  className="text-gray-400 hover:text-[#1E90DB] transition-colors"
                >
                  Commercial Construction
                </a>
              </li>
              <li>
                <a
                  href="/services"
                  className="text-gray-400 hover:text-[#1E90DB] transition-colors"
                >
                  Residential Construction
                </a>
              </li>
              <li>
                <a
                  href="/services"
                  className="text-gray-400 hover:text-[#1E90DB] transition-colors"
                >
                  Renovation & Remodeling
                </a>
              </li>
              <li>
                <a
                  href="/services"
                  className="text-gray-400 hover:text-[#1E90DB] transition-colors"
                >
                  Project Planning & Design
                </a>
              </li>
              <li>
                <a
                  href="/services"
                  className="text-gray-400 hover:text-[#1E90DB] transition-colors"
                >
                  Industrial Construction
                </a>
              </li>
              <li>
                <a
                  href="/services"
                  className="text-gray-400 hover:text-[#1E90DB] transition-colors"
                >
                  Construction Management
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h5 className="text-white font-montserrat font-bold mb-6">
              Newsletter
            </h5>
            <p className="text-gray-400 mb-4 leading-relaxed">
              Subscribe to our newsletter to receive updates on our latest
              projects and industry insights.
            </p>
            <NewsletterSubscription className="bg-transparent p-0 text-white" />
            <p className="text-gray-400 text-sm mt-2">
              By subscribing, you agree to our{" "}
              <Link
                href="/privacy-policy"
                className="text-[#1E90DB] hover:underline"
              >
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-col justify-center items-center text-gray-400 text-sm">
            <p className="text-center mb-4">
              &copy; {new Date().getFullYear()} ARCEM Construction Company. All
              rights reserved.
            </p>
            <div className="flex space-x-6 mt-2 md:mt-2">
              <Link
                href="/privacy-policy"
                className="hover:text-[#1E90DB] transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms-of-service"
                className="hover:text-[#1E90DB] transition-colors"
              >
                Terms of Service
              </Link>
              <Link
                href="/sitemap"
                className="hover:text-[#1E90DB] transition-colors"
              >
                Sitemap
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
