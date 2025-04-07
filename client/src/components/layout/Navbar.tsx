import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Menu, X, User, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import NotificationBadge from "@/components/common/NotificationBadge";

type NavbarProps = {
  isScrolled: boolean;
};

const Navbar = ({ isScrolled }: NavbarProps) => {
  const [location, navigate] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [logoAnimated, setLogoAnimated] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const logoRef = useRef<HTMLImageElement>(null);

  // Check if we're on an admin page
  const isAdminPage = location.startsWith("/admin");

  // Check if we're on a project detail page
  const isProjectDetailPage = location.match(/^\/projects\/\d+$/) !== null;

  // Logo animation on page load
  useEffect(() => {
    // Delay the animation to ensure it happens after initial render
    const timer = setTimeout(() => {
      setLogoAnimated(true);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (
        !target.closest("#mobile-menu") &&
        !target.closest("#mobile-menu-button")
      ) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Navigation items
  const navItems = [
    { label: "HOME", href: "/" },
    { label: "ABOUT", href: "/about" },
    { label: "SERVICES", href: "/services" },
    { label: "PROJECTS", href: "/projects" },
    { label: "BLOG", href: "/blog" },
    { label: "JOIN US", href: "/join-us" },
    { label: "REACH US", href: "/contact" },
  ];

  return (
    <nav
      id="navbar"
      className={cn(
        "fixed w-full z-50 py-4 transition-all duration-300",
        isAdminPage
          ? "navbar-admin"
          : "navbar-fixed",
      )}
    >
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex justify-between items-center">
          <Link
            href="/"
            className="text-white font-montserrat font-bold flex items-center overflow-hidden"
          >
            <div className="relative h-12 sm:h-14 md:h-16 transform transition-all duration-500">
              <img
                ref={logoRef}
                src="/uploads/images/arcem-logo-transparent.png?v=1"
                alt="A+R C.E.M Logo"
                className={cn(
                  "h-full w-auto max-w-[280px] object-contain transform transition-all duration-1000 ease-out",
                  logoAnimated
                    ? "translate-x-0 opacity-100"
                    : "-translate-x-full opacity-0",
                )}
              />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-white font-montserrat text-sm font-medium relative group px-2 py-1",
                  location === item.href ? "text-[#47A6ED]" : "",
                )}
              >
                <span className="relative z-10 transition-colors duration-300 group-hover:text-[#47A6ED]">
                  {item.label}
                </span>
                <span
                  className={cn(
                    "absolute bottom-0 left-0 w-0 h-0.5 bg-[#47A6ED] transition-all duration-300 group-hover:w-full",
                    location === item.href ? "w-full" : "w-0",
                  )}
                ></span>
              </Link>
            ))}

            {/* Notification Badge - only show for authenticated users */}
            {isAuthenticated && (
              <div className="flex items-center">
                <NotificationBadge />
              </div>
            )}

            {/* Login/Admin/Logout Buttons */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-2">
                <Link
                  href="/admin"
                  className="bg-[#1E90DB] hover:bg-[#1670B0] text-white px-4 py-2 rounded-sm flex items-center space-x-1 font-montserrat text-sm transition-colors"
                >
                  <User className="w-4 h-4 mr-1" />
                  ADMIN
                </Link>
                <button
                  onClick={() => logout()} 
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-sm flex items-center space-x-1 font-montserrat text-sm transition-colors"
                >
                  <LogOut className="w-4 h-4 mr-1" />
                  LOGOUT
                </button>
              </div>
            ) : (
              <Link
                href="/auth/login"
                className="bg-[#1E90DB] hover:bg-[#1670B0] text-white px-4 py-2 rounded-sm flex items-center space-x-1 font-montserrat text-sm transition-colors"
              >
                <User className="w-4 h-4 mr-1" />
                LOGIN
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            id="mobile-menu-button"
            className="md:hidden text-white focus:outline-none"
            onClick={toggleMobileMenu}
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        <div
          id="mobile-menu"
          className={cn(
            "md:hidden bg-black bg-opacity-95 absolute left-0 right-0 mt-4 py-4 px-4 slide-in z-50",
            isMobileMenuOpen ? "block" : "hidden",
          )}
        >
          <div className="flex flex-col space-y-4">
            {/* Logo in mobile menu */}
            <div className="mb-4 flex justify-center">
              <img
                src="/uploads/images/arcem-logo-transparent.png?v=1"
                alt="A+R C.E.M Logo"
                className="h-10 w-auto object-contain"
              />
            </div>
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-white font-montserrat text-sm font-medium relative group px-2 py-2 block",
                  location === item.href ? "text-[#47A6ED]" : "",
                )}
                onClick={closeMobileMenu}
              >
                <span className="relative z-10 transition-colors duration-300 group-hover:text-[#47A6ED]">
                  {item.label}
                </span>
                <span
                  className={cn(
                    "absolute bottom-0 left-0 w-0 h-0.5 bg-[#47A6ED] transition-all duration-300 group-hover:w-full",
                    location === item.href ? "w-full" : "w-0",
                  )}
                ></span>
              </Link>
            ))}

            {/* Mobile Notification Badge */}
            {isAuthenticated && (
              <div className="flex items-center justify-start py-2">
                <NotificationBadge />
                <span className="ml-2 text-white font-montserrat text-sm">
                  Notifications
                </span>
              </div>
            )}

            {/* Mobile Login/Admin Button */}
            {isAuthenticated ? (
              <div className="flex flex-col space-y-2">
                <Link
                  href="/admin"
                  className="bg-[#1E90DB] hover:bg-[#1670B0] text-white px-4 py-2 rounded-sm flex items-center justify-center space-x-1 font-montserrat text-sm transition-colors"
                  onClick={closeMobileMenu}
                >
                  <User className="w-4 h-4 mr-1" />
                  ADMIN
                </Link>
                <button
                  onClick={() => {
                    closeMobileMenu();
                    logout();
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-sm flex items-center justify-center space-x-1 font-montserrat text-sm transition-colors"
                >
                  <LogOut className="w-4 h-4 mr-1" />
                  LOGOUT
                </button>
              </div>
            ) : (
              <Link
                href="/auth/login"
                className="bg-[#1E90DB] hover:bg-[#1670B0] text-white px-4 py-2 rounded-sm flex items-center justify-center space-x-1 font-montserrat text-sm transition-colors"
                onClick={closeMobileMenu}
              >
                <User className="w-4 h-4 mr-1" />
                LOGIN
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
