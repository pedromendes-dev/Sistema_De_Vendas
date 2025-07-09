import { Link, useLocation } from "wouter";
import { DollarSign, Trophy, History, Users, Shield, Target } from "lucide-react";

interface NavigationItem {
  path: string;
  label: string;
  icon: React.ComponentType<{ size?: number }>;
}

const navigationItems: NavigationItem[] = [
  { path: "/", label: "Registrar Vendas", icon: DollarSign },
  { path: "/ranking", label: "Ranking", icon: Trophy },
  { path: "/history", label: "Histórico", icon: History },
  { path: "/attendants", label: "Atendentes", icon: Users },
  { path: "/goals", label: "Metas", icon: Target },
  { path: "/admin", label: "Área do Gestor", icon: Shield },
];

export default function Navigation() {
  const [location] = useLocation();

  return (
    <nav className="bg-secondary-dark border-b border-gray-700 mobile-container">
      <div className="mobile-safe max-w-6xl">
        <div className="nav-mobile flex space-x-1 sm:space-x-4 lg:space-x-8">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.path;
            
            return (
              <Link key={item.path} href={item.path}>
                <div
                  className={`
                    flex flex-col sm:flex-row items-center gap-1 sm:gap-2 px-2 sm:px-3 lg:px-4 py-2 sm:py-3 lg:py-4 text-xs sm:text-sm font-medium transition-colors cursor-pointer
                    border-b-2 border-transparent whitespace-nowrap flex-shrink-0 min-w-max
                    ${
                      isActive
                        ? "text-success border-success bg-success/5"
                        : "text-secondary-light hover:text-primary-light hover:border-gray-600"
                    }
                  `}
                >
                  <Icon size={14} className="sm:w-4 sm:h-4 lg:w-[18px] lg:h-[18px]" />
                  <span className="text-xs sm:text-sm leading-tight text-center">{item.label}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}