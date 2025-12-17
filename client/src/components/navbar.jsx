import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Menu, X, ChevronDown } from "lucide-react";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Services", href: "#services" },
    { name: "Doctors", href: "#doctors" },
    { name: "About", href: "#about" },
    { name: "Contact", href: "#contact" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled || location.pathname !== "/"
          ? "bg-white shadow-md py-2"
          : "bg-transparent py-4"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center">
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent transition-transform duration-200 hover:rotate-[3deg]">
              MediCare+
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className={`text-sm font-medium  hover:text-blue-700 hover:drop-shadow-[0_0_6px_rgba(59,130,246,0.7)] transition duration-200 ${
                  location.pathname === link.href || location.hash === link.href
                    ? "text-blue-500"
                    : isScrolled || location.pathname !== "/"
                    ? "text-gray-700"
                    : "text-blue-500"
                }`}
                onClick={(e) => {
                  if (link.href.startsWith("#")) {
                    e.preventDefault();
                    const targetElement = document.getElementById(
                      link.href.substring(1)
                    );
                    if (targetElement) {
                      window.scrollTo({
                        top: targetElement.offsetTop - 80, // Adjust for fixed header height
                        behavior: "smooth",
                      });
                    }
                  } else if (link.href === "/") {
                    // For the home link, ensure scroll to top if already on home
                    window.scrollTo({
                      top: 0,
                      behavior: "smooth",
                    });
                  }
                  setIsMobileMenuOpen(false); // Close mobile menu on click
                }}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant={
                    isScrolled || location.pathname !== "/"
                      ? "outline"
                      : "secondary"
                  }
                  className="flex items-center gap-1 hover:bg-blue-100 transition duration-200 ease-in-out hover:shadow-lg hover:-translate-y-[1px]"
                >
                  Staff Login <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link
                    to="/login?role=doctor"
                    className="w-full cursor-pointer "
                  >
                    Doctor Login
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    to="/login?role=admin"
                    className="w-full cursor-pointer "
                  >
                    Admin Login
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              asChild
              variant={
                isScrolled || location.pathname !== "/"
                  ? "default"
                  : "secondary"
              }
              className={`transition duration-200 ease-in-out hover:shadow-lg hover:-translate-y-[1px] ${
                isScrolled || location.pathname !== "/"
                  ? "bg-blue-500 text-white hover:bg-blue-600"
                  : "hover:bg-blue-100 text-black"
              }`}
            >
              <Link to="/frontdesk">Patient Registration</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden focus:outline-none"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X
                className={`h-6 w-6 ${
                  isScrolled || location.pathname !== "/"
                    ? "text-gray-700"
                    : "text-white"
                }`}
              />
            ) : (
              <Menu
                className={`h-6 w-6 ${
                  isScrolled || location.pathname !== "/"
                    ? "text-gray-700"
                    : "text-white"
                }`}
              />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden pt-4 pb-3 space-y-3 bg-white rounded-lg mt-2 shadow-lg">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className={`block px-4 py-2 text-sm font-medium ${
                  location.pathname === link.href || location.hash === link.href
                    ? "text-blue-500"
                    : "text-gray-700"
                }`}
                onClick={(e) => {
                  if (link.href.startsWith("#")) {
                    e.preventDefault();
                    const targetElement = document.getElementById(
                      link.href.substring(1)
                    );
                    if (targetElement) {
                      window.scrollTo({
                        top: targetElement.offsetTop - 80, // Adjust for fixed header height
                        behavior: "smooth",
                      });
                    }
                  } else if (link.href === "/") {
                    // For the home link, ensure scroll to top if already on home
                    window.scrollTo({
                      top: 0,
                      behavior: "smooth",
                    });
                  }
                  setIsMobileMenuOpen(false); // Close mobile menu on click
                }}
              >
                {link.name}
              </Link>
            ))}
            <div className="pt-2 space-y-2 px-4">
              <Link
                to="/login?role=doctor"
                className="block py-2 text-sm font-medium text-gray-700"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Doctor Login
              </Link>
              <Link
                to="/login?role=admin"
                className="block py-2 text-sm font-medium text-gray-700"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Admin Login
              </Link>
              <Button asChild className="w-full mt-2">
                <Link
                  to="/frontdesk"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Patient Registration
                </Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
