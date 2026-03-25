'use client';

import { Menu, X } from 'lucide-react';
import { useRouter } from 'next/dist/client/components/navigation';
import { useState } from 'react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const router = useRouter();

  const navLinks = [
    { name: 'Product', href: '#' },
    { name: 'Features', href: '#' },
    { name: 'Pricing', href: '#' },
    { name: 'Docs', href: '#' },
  ];
  
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-accent"></div>
            <span className="text-lg font-semibold text-foreground">NexCore</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.name}
              </a>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <button onClick={() => {
                router.push('/login')
            }} className="px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary transition-colors rounded-full">
              Sign In
            </button>
            <button onClick={() => {
                router.push('/register')
            }} className="px-4 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-full hover:bg-black/95 transition-colors">
              Get Started
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-secondary transition-colors"
            aria-label="Toggle menu"
          >
            {isOpen ? (
              <X className="w-5 h-5 text-foreground" />
            ) : (
              <Menu className="w-5 h-5 text-foreground" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden border-t border-border">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="block px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                >
                  {link.name}
                </a>
              ))}
              <div className="pt-2 space-y-2">
                <button className="w-full px-3 py-2 text-sm font-medium text-foreground hover:bg-secondary rounded-lg transition-colors">
                  Sign In
                </button>
                <button className="w-full px-3 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-lg hover:bg-black/95 transition-colors">
                  Get Started
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
