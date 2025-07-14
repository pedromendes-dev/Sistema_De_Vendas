
import { useCallback, useEffect } from 'react';

export const useSaleSound = () => {
  // Criar contexto de áudio
  const audioContext = useCallback(() => {
    try {
      return new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (e) {
      console.warn('Web Audio API não suportada');
      return null;
    }
  }, []);

  // Som de dinheiro/venda
  const playSaleSound = useCallback(async () => {
    const ctx = audioContext();
    if (!ctx) return;

    try {
      // Criar oscilador para som de dinheiro
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      // Configurar som de "cha-ching" (dinheiro)
      oscillator.frequency.setValueAtTime(800, ctx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);
      oscillator.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.3);
      
      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.5);
      
      // Adicionar segundo tom para efeito "cha-ching"
      setTimeout(() => {
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        
        osc2.frequency.setValueAtTime(1000, ctx.currentTime);
        osc2.frequency.exponentialRampToValueAtTime(500, ctx.currentTime + 0.2);
        
        gain2.gain.setValueAtTime(0, ctx.currentTime);
        gain2.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.01);
        gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        
        osc2.start(ctx.currentTime);
        osc2.stop(ctx.currentTime + 0.3);
      }, 100);
      
    } catch (error) {
      console.warn('Erro ao reproduzir som:', error);
    }
  }, [audioContext]);

  // Som de sucesso (para grandes vendas)
  const playSuccessSound = useCallback(async () => {
    const ctx = audioContext();
    if (!ctx) return;

    try {
      // Sequência de tons ascendentes (success)
      const frequencies = [523, 659, 784, 1047]; // C, E, G, C (acorde)
      
      frequencies.forEach((freq, index) => {
        setTimeout(() => {
          const oscillator = ctx.createOscillator();
          const gainNode = ctx.createGain();
          
          oscillator.connect(gainNode);
          gainNode.connect(ctx.destination);
          
          oscillator.frequency.setValueAtTime(freq, ctx.currentTime);
          oscillator.type = 'sine';
          
          gainNode.gain.setValueAtTime(0, ctx.currentTime);
          gainNode.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.01);
          gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
          
          oscillator.start(ctx.currentTime);
          oscillator.stop(ctx.currentTime + 0.3);
        }, index * 80);
      });
      
    } catch (error) {
      console.warn('Erro ao reproduzir som de sucesso:', error);
    }
  }, [audioContext]);

  return {
    playSaleSound,
    playSuccessSound
  };
};
