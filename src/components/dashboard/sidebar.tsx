"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { 
  BarChart3, 
  Mail, 
  DollarSign, 
  Users, 
  Menu,
  Settings,
  RefreshCw,
  Workflow
} from 'lucide-react';

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();

  const navigation = [
    { name: 'Overview', href: '/dashboard/overview', icon: BarChart3, current: pathname === '/dashboard/overview' },
    { name: 'Campaigns', href: '/campaigns', icon: Mail, current: pathname === '/campaigns' },
    { name: 'Flows', href: '/flows', icon: Workflow, current: pathname === '/flows' },
    { name: 'Email Performance', href: '/dashboard/email-performance', icon: Mail, current: pathname === '/dashboard/email-performance' },
    { name: 'Revenue Analytics', href: '/dashboard/revenue', icon: DollarSign, current: pathname === '/dashboard/revenue' },
    { name: 'Customer Insights', href: '/dashboard/customers', icon: Users, current: pathname === '/dashboard/customers' },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings, current: pathname === '/dashboard/settings' },
  ];

  return (
    <div className={cn("pb-12 min-h-screen", className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <div className="flex items-center mb-6">
            <BarChart3 className="h-8 w-8 text-primary mr-3" />
            <div>
              <h2 className="text-lg font-semibold tracking-tight">
                Email Analytics
              </h2>
              <p className="text-xs text-muted-foreground">
                Dashboard
              </p>
            </div>
          </div>
          <div className="space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors",
                  pathname === item.href
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground"
                )}
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.name}
              </Link>
            ))}
          </div>
        </div>
        
        <div className="px-3 py-2">
          <div className="space-y-1">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-muted-foreground hover:text-accent-foreground"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Sync Data
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-muted-foreground hover:text-accent-foreground"
            >
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function MobileSidebar() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
        >
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="pr-0">
        <Sidebar />
      </SheetContent>
    </Sheet>
  );
}
