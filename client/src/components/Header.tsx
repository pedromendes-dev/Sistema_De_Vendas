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
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-primary-light mb-1 flex items-center gap-2">
              💰 Sistema de Vendas
            </h1>
            <p className="text-lg text-secondary-light font-medium">Painel Gamificado de Controle de Vendas</p>
            <p className="text-sm text-muted-light mt-1">{getCurrentDate()}</p>
          </div>

        </div>
      </div>
    </header>
  );
}