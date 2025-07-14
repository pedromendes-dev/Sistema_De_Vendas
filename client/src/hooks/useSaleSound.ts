
import { useCallback, useRef } from 'react';

export function useSaleSound() {
  const audioContextRef = useRef<AudioContext | null>(null);
  
  const createCashRegisterSound = useCallback(() => {
    try {
      // Criar AudioContext se não existir
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      const audioContext = audioContextRef.current;
      const currentTime = audioContext.currentTime;
      
      // Som de caixa registradora - múltiplos tons
      const frequencies = [800, 1200, 1600, 2000, 1400, 1000];
      const duration = 0.8;
      
      frequencies.forEach((freq, index) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(freq, currentTime + index * 0.1);
        oscillator.type = 'sine';
        
        // Envelope para som mais suave
        gainNode.gain.setValueAtTime(0, currentTime + index * 0.1);
        gainNode.gain.linearRampToValueAtTime(0.3, currentTime + index * 0.1 + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + index * 0.1 + 0.15);
        
        oscillator.start(currentTime + index * 0.1);
        oscillator.stop(currentTime + index * 0.1 + 0.2);
      });
      
      // Som de moedas caindo
      setTimeout(() => {
        const coinSounds = [600, 800, 1000, 1200];
        coinSounds.forEach((freq, index) => {
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          
          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);
          
          oscillator.frequency.setValueAtTime(freq, currentTime + 0.3 + index * 0.05);
          oscillator.type = 'triangle';
          
          gainNode.gain.setValueAtTime(0, currentTime + 0.3 + index * 0.05);
          gainNode.gain.linearRampToValueAtTime(0.2, currentTime + 0.3 + index * 0.05 + 0.02);
          gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.3 + index * 0.05 + 0.1);
          
          oscillator.start(currentTime + 0.3 + index * 0.05);
          oscillator.stop(currentTime + 0.3 + index * 0.05 + 0.1);
        });
      }, 100);
      
    } catch (error) {
      console.log('Audio not supported or blocked');
    }
  }, []);
  
  const playSaleSound = useCallback(() => {
    // Verificar se o som está habilitado
    const settings = localStorage.getItem('app_settings');
    const soundEnabled = settings ? JSON.parse(settings).soundEnabled !== false : true;
    
    if (soundEnabled) {
      createCashRegisterSound();
    }
  }, [createCashRegisterSound]);
  
  return { playSaleSound };
}
