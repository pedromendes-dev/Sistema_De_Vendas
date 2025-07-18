import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { queryClient } from '@/lib/queryClient';

// Hook para garantir refresh adequado ao mudar de rota
export function useRouteChange() {
  const [location] = useLocation();
  const [isReady, setIsReady] = useState(true);

  useEffect(() => {
    // Marca como não pronto ao mudar de rota
    setIsReady(false);
    
    // Pequeno delay para garantir que o componente renderize corretamente
    const timer = setTimeout(() => {
      // Invalida queries específicas baseadas na rota
      switch (location) {
        case '/':
        case '/attendants':
          queryClient.invalidateQueries({ queryKey: ['/api/attendants'] });
          break;
        case '/history':
          queryClient.invalidateQueries({ queryKey: ['/api/sales'] });
          break;
        case '/ranking':
          queryClient.invalidateQueries({ queryKey: ['/api/attendants'] });
          queryClient.invalidateQueries({ queryKey: ['/api/sales'] });
          break;
        case '/goals':
          queryClient.invalidateQueries({ queryKey: ['/api/goals'] });
          queryClient.invalidateQueries({ queryKey: ['/api/achievements'] });
          break;
        case '/admin':
          queryClient.invalidateQueries({ queryKey: ['/api/admin'] });
          break;
      }
      
      // Scroll para o topo
      window.scrollTo(0, 0);
      
      // Marca como pronto
      setIsReady(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, [location]);

  return isReady;
}