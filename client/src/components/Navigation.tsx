import { Link, useLocation } from "wouter";
import { DollarSign, Trophy, History, Users, Shield, Target, LayoutDashboard } from "lucide-react";

interface NavigationItem {
  path: string;
  label: string;
  icon: React.ComponentType<{ size?: number }>;
}

const navigationItems: NavigationItem[] = [
  { path: "/", label: "Registrar Vendas", icon: DollarSign },
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/ranking", label: "Ranking", icon: Trophy },
  { path: "/history", label: "Histórico", icon: History },
  { path: "/attendants", label: "Atendentes", icon: Users },
  { path: "/goals", label: "Metas", icon: Target },
  { path: "/admin", label: "Área do Gestor", icon: Shield },
];

export default function Navigation() {
  const [location] = useLocation();

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden sm:block bg-secondary-dark border-b border-gray-700 constrain-width">
        <div className="universal-container">
          <div className="flex space-x-4 overflow-x-auto nav-adaptive mobile-scroll">
            {navigationItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = location === item.path;
              
              return (
                <Link key={item.path} href={item.path}>
                  <div
                    className={`
                      flex items-center gap-2 space-adaptive text-fluid-sm font-medium transition-all duration-200 cursor-pointer
                      border-b-2 border-transparent whitespace-nowrap touch-adaptive
                      hover:transform hover:scale-105
                      ${
                        isActive
                          ? "text-success border-success bg-success/5 shadow-lg transform scale-105"
                          : "text-secondary-light hover:text-primary-light hover:border-gray-600 hover:bg-accent-dark/30"
                      }
                    `}
                  >
                    <Icon className="icon-adaptive" />
                    <span>{item.label}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Mobile Navigation - Bottom Fixed */}
      <div className="sm:hidden bg-card border-t border-border/30 fixed bottom-0 left-0 right-0 z-50 constrain-width">
        <div className="grid grid-cols-4 bottom-nav-adaptive overflow-x-auto">
          {navigationItems.map(({ path, label, icon: Icon }) => {
            const isActive = location === path;
            
            return (
              <Link 
                key={path} 
                href={path}
                className={`
                  flex flex-col items-center justify-center gap-1 transition-all duration-200 bottom-nav-item touch-adaptive
                  ${isActive 
                    ? 'text-success bg-success/10 border-t-2 border-success' 
                    : 'text-secondary-light hover:text-primary-light hover:bg-card/50'
                  }
                `}
              >
                <Icon className="icon-adaptive flex-shrink-0" />
                <span className="text-fluid-xs font-medium leading-tight text-center max-w-full truncate px-1">
                  {label}
                </span>
              </Link>
            );
          })}
        </div>
        {/* Safe area padding for devices with home indicator */}
        <div className="h-safe-area-inset-bottom bg-card"></div>
      </div>

      {/* Spacer for mobile navigation */}
      <div className="sm:hidden h-16"></div>
    </>
  );
}