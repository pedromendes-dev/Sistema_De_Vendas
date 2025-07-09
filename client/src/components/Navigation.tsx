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
    <nav className="bg-secondary-dark border-b border-gray-700">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex space-x-8">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.path;
            
            return (
              <Link key={item.path} href={item.path}>
                <div
                  className={`
                    flex items-center gap-2 px-4 py-4 text-sm font-medium transition-colors cursor-pointer
                    border-b-2 border-transparent
                    ${
                      isActive
                        ? "text-success border-success bg-success/5"
                        : "text-secondary-light hover:text-primary-light hover:border-gray-600"
                    }
                  `}
                >
                  <Icon size={18} />
                  {item.label}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}