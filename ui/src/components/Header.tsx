import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Play, User, LogOut, ChevronDown } from 'lucide-react';

type HeaderProps = {
  address: string | null;
  isRegistered: boolean;
  onLogin: () => void;
  onRegister: () => void;
  onLogout: () => void;
};

export function Header({ address, isRegistered, onLogin, onRegister, onLogout }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const navItems = [
    { label: 'Home', path: '/' },
    { label: 'Movies', path: '/movies' },
    { label: 'Series', path: '/series' },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <nav
      className={`fixed top-1 left-0 right-0 z-50 transition-all duration-300 ${scrolled
        ? 'bg-[var(--color-navy-dark)] shadow-lg'
        : 'bg-[var(--color-navy)]'
        }`}
    >
      <div className="max-w-[1440px] mx-auto px-6 lg:px-10 py-0 flex items-center justify-between h-14">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded bg-[var(--color-red)] flex items-center justify-center">
            <Play className="w-4 h-4 text-white fill-white ml-0.5" />
          </div>
          <span
            className="text-xl font-bold tracking-wide uppercase text-white"
          >
            Sub<span className="text-[var(--color-gold)]">Stream</span>
          </span>
        </Link>

        {/* Nav Tabs */}
        <div className="hidden md:flex items-center gap-0">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`relative px-5 py-4 text-[15px] font-semibold uppercase tracking-wider transition-colors duration-200 ${isActive(item.path)
                ? 'text-white'
                : 'text-white/60 hover:text-white'
                }`}
            >
              {item.label}
              {isActive(item.path) && (
                <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-[var(--color-red)]" />
              )}
            </Link>
          ))}
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-3">
          {isRegistered && address ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded border border-white/20 hover:border-white/40 transition-colors duration-200"
              >
                <div className="w-6 h-6 rounded-full bg-[var(--color-gold)] flex items-center justify-center">
                  <User className="w-3 h-3 text-[var(--color-navy-dark)]" />
                </div>
                <span className="text-xs font-mono text-white/70 hidden sm:inline">
                  {address.slice(0, 6)}...{address.slice(-4)}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-white/60 transition-transform duration-200 ${menuOpen ? 'rotate-180' : ''}`} />
              </button>

              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 w-48 rounded-lg bg-white border border-[var(--color-border)] shadow-xl z-50 overflow-hidden animate-fade-in">
                    <Link
                      to="/account"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-sm text-[var(--color-text)] hover:bg-[var(--color-bg-alt)] transition-colors"
                    >
                      <User className="w-4 h-4 text-[var(--color-navy)]" />
                      Account
                    </Link>
                    <Link
                      to="/subscribe"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-sm text-[var(--color-text)] hover:bg-[var(--color-bg-alt)] transition-colors border-t border-[var(--color-border)]"
                    >
                      <Play className="w-4 h-4 text-[var(--color-navy)]" />
                      My Subscription
                    </Link>
                    <button
                      onClick={() => { onLogout(); setMenuOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-[var(--color-red)] hover:bg-red-50 transition-colors border-t border-[var(--color-border)]"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={onLogin}
                className="px-4 py-1.5 text-[15px] font-semibold uppercase tracking-wide text-white/70 hover:text-white transition-colors duration-200"
              >
                Sign In
              </button>
              <button
                onClick={onRegister}
                className="px-5 py-1.5 text-[15px] font-bold uppercase tracking-wide text-[var(--color-navy-dark)] bg-[var(--color-gold)] hover:bg-[#D4AF57] rounded transition-colors duration-200 active:scale-95"
              >
                Get Started
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
