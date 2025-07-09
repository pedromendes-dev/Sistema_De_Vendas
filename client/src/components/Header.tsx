import NotificationSystem from './NotificationSystem';

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
    <header className="bg-card border-b border-border">
      <div className="max-w-6xl mx-auto px-4 py-4 sm:py-6">
        <div className="flex justify-between items-center">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-3xl font-bold text-primary-light mb-1 flex items-center gap-2">
              💰 Sistema de Vendas
            </h1>
            <p className="text-sm sm:text-lg text-secondary-light font-medium">Painel Gamificado de Controle de Vendas</p>
            <p className="text-xs sm:text-sm text-muted-light mt-1 hidden sm:block">{getCurrentDate()}</p>
          </div>

          <div className="flex items-center gap-3 ml-4">
            <NotificationSystem />
          </div>
        </div>
      </div>
    </header>
  );
}