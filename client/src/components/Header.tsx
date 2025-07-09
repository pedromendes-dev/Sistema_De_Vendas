import NotificationCenter from './NotificationCenter';

export default function Header() {

  const getCurrentDate = () => {
    const now = new Date();
    const days = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];
    const months = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
    
    const dayName = days[now.getDay()];
    const day = now.getDate();
    const month = months[now.getMonth()];
    const year = now.getFullYear();
    
    return `${dayName}, ${day} de ${month} de ${year}`;
  };

  return (
    <header className="bg-card border-b border-border mobile-container mobile-safe-area mobile-gpu-accelerated">
      <div className="mobile-safe max-w-6xl">
        <div className="flex justify-between items-center py-3 sm:py-4 lg:py-6">
          <div className="flex-1 min-w-0 pr-3 mobile-fade-in">
            <h1 className="text-responsive-xl font-bold text-primary-light mb-1 flex items-center gap-1 sm:gap-2 mobile-text-optimized">
              <span className="text-xl sm:text-2xl lg:text-3xl">💰</span> 
              <span className="truncate">Sistema de Vendas</span>
            </h1>
            <p className="text-xs sm:text-sm lg:text-lg text-secondary-light font-medium truncate mobile-text-optimized">
              Painel Gamificado de Controle de Vendas
            </p>
            <p className="text-xs text-muted-light mt-1 hidden lg:block mobile-text-optimized">
              {getCurrentDate()}
            </p>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 mobile-fade-in" style={{ animationDelay: '0.1s' }}>
            <NotificationCenter />
          </div>
        </div>
      </div>
    </header>
  );
}