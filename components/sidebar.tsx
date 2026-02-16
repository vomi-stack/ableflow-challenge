'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LayoutDashboard, Activity, ScrollText, AlertTriangle, BarChart3, Workflow } from 'lucide-react';

const navigation = [
  { name: 'Project Board', href: '/', icon: LayoutDashboard },
  { name: 'System Monitoring', href: '/monitoring', icon: Activity },
  { name: 'Incident Response', href: '/incidents', icon: AlertTriangle },
  { name: 'Audit Logs', href: '/audit-logs', icon: ScrollText },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex w-64 flex-col border-r border-gray-800 bg-gray-900">
      <div className="flex h-16 items-center gap-2 border-b border-gray-800 px-6">
        <Workflow className="h-8 w-8 text-blue-500" />
        <div>
          <h1 className="text-xl font-bold text-white">AbleFlow</h1>
          <p className="text-xs text-gray-400">Task & Reliability</p>
        </div>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-gray-800 p-4">
        <div className="rounded-lg bg-gray-800 p-3">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <div className="h-2 w-2 rounded-full bg-green-500"></div>
            System Operational
          </div>
          <div className="mt-2 text-xs text-gray-500">
            All services running normally
          </div>
        </div>
      </div>
    </div>
  );
}
