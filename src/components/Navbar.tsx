import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  ArrowRightEndOnRectangleIcon,
  UserPlusIcon,
  ArrowLeftEndOnRectangleIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';

const NAV_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'Game Patches', to: '/patches' },
  { label: 'Server Status', to: '/status' },
  { label: 'FAQs', to: '/faqs' },
];

export default function Navbar() {
  const { isAuthenticated, signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileDropdown, setMobileDropdown] = useState(false);

  function handleLogout() {
    signOut();
    navigate('/');
  }

  return (
    <nav className="sticky top-0 z-50 w-full bg-gray-900 shadow-lg">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* LEFT — Brand */}
          <div className="flex-shrink-0">
            <Link
              to="/"
              className="text-xl font-bold tracking-wide text-orange-400 hover:text-orange-300 transition-colors"
            >
              🏀 Basketball Manager
            </Link>
          </div>

          {/* MIDDLE — Nav links (desktop) */}
          <div className="hidden md:flex items-center gap-1">
            {isAuthenticated ? (
              <>
                <NavLink
                  to="/choose-scenario"
                  className={({ isActive }) =>
                    `px-4 py-2 rounded-md text-sm font-bold tracking-wide transition-colors ${
                      isActive
                        ? 'text-orange-400'
                        : 'text-orange-500 hover:text-gray-300'
                    }`
                  }
                >
                  My Scenarios
                </NavLink>
                <NavLink
                  to="/account"
                  className={({ isActive }) =>
                    `px-4 py-2 rounded-md text-sm font-bold tracking-wide transition-colors ${
                      isActive
                        ? 'text-orange-400'
                        : 'text-orange-500 hover:text-gray-300'
                    }`
                  }
                >
                  My Account
                </NavLink>
              </>
            ) : (
              NAV_LINKS.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === '/'}
                  className={({ isActive }) =>
                    `px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-orange-500 text-white'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))
            )}
          </div>

          {/* RIGHT — Auth actions (desktop) */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
              >
                <ArrowLeftEndOnRectangleIcon className="h-4 w-4" />
                Logout
              </button>
            ) : (
              <>
                <NavLink
                  to="/login"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                >
                  <ArrowRightEndOnRectangleIcon className="h-4 w-4" />
                  Login
                </NavLink>
                <NavLink
                  to="/register"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-semibold bg-orange-500 text-white hover:bg-orange-400 transition-colors"
                >
                  <UserPlusIcon className="h-4 w-4" />
                  Create Account
                </NavLink>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label="Toggle menu"
          >
            <span className="block w-5 h-0.5 bg-current mb-1" />
            <span className="block w-5 h-0.5 bg-current mb-1" />
            <span className="block w-5 h-0.5 bg-current" />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-gray-800 border-t border-gray-700 px-4 pb-4 pt-2 space-y-1">
          {isAuthenticated ? (
            <button
              onClick={() => { setMobileOpen(false); handleLogout(); }}
              className="flex items-center gap-2 w-full px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
            >
              <ArrowLeftEndOnRectangleIcon className="h-4 w-4" />
              Logout
            </button>
          ) : (
            <>
              {/* Navigation links with toggle */}
              <button
                className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 rounded-md"
                onClick={() => setMobileDropdown((prev) => !prev)}
              >
                Navigation
                <ChevronDownIcon
                  className={`h-4 w-4 transition-transform ${mobileDropdown ? 'rotate-180' : ''}`}
                />
              </button>
              {mobileDropdown &&
                NAV_LINKS.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    end={link.to === '/'}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      `block pl-6 pr-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-orange-500 text-white'
                          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      }`
                    }
                  >
                    {link.label}
                  </NavLink>
                ))}

              <div className="border-t border-gray-700 pt-2 space-y-1">
                <NavLink
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
                >
                  <ArrowRightEndOnRectangleIcon className="h-4 w-4" />
                  Login
                </NavLink>
                <NavLink
                  to="/register"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-semibold bg-orange-500 text-white hover:bg-orange-400"
                >
                  <UserPlusIcon className="h-4 w-4" />
                  Create Account
                </NavLink>
              </div>
            </>
          )}
        </div>
      )}
    </nav>
  );
}

