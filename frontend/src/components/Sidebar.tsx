"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, FileText, AlertCircle, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from './ui/button';

export function Sidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  const links = [
    { href: '/dashboard', label: 'Dashboard', icon: Home },
    { href: '/notes', label: 'Notes', icon: FileText },
    { href: '/alerts', label: 'Alerts', icon: AlertCircle },
  ];

  return (
    <div className="flex h-screen w-64 flex-col border-r bg-card">
      <div className="p-6">
        <h1 className="text-2xl font-bold">Notes App</h1>
      </div>
      
      <nav className="flex-1 space-y-1 px-3">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              }`}
            >
              <Icon className="h-5 w-5" />
              {link.label}
            </Link>
          );
        })}
      </nav>
      
      <div className="p-3">
        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={logout}
        >
          <LogOut className="mr-3 h-5 w-5" />
          Logout
        </Button>
      </div>
    </div>
  );
}
