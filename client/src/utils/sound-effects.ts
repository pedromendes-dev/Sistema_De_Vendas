// Cash register sound effect using Web Audio API

let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioContext;
}

export function playCashRegisterSound() {
  try {
    const ctx = getAudioContext();
    const currentTime = ctx.currentTime;

    // Create oscillators for different components of the cash register sound
    
    // Bell sound (ding)
    const bell = ctx.createOscillator();
    const bellGain = ctx.createGain();
    bell.frequency.setValueAtTime(1200, currentTime);
    bell.frequency.exponentialRampToValueAtTime(800, currentTime + 0.1);
    bellGain.gain.setValueAtTime(0.3, currentTime);
    bellGain.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.3);
    bell.connect(bellGain);
    bellGain.connect(ctx.destination);
    bell.start(currentTime);
    bell.stop(currentTime + 0.3);

    // Second bell (higher pitch)
    const bell2 = ctx.createOscillator();
    const bell2Gain = ctx.createGain();
    bell2.frequency.setValueAtTime(1600, currentTime + 0.05);
    bell2.frequency.exponentialRampToValueAtTime(1200, currentTime + 0.15);
    bell2Gain.gain.setValueAtTime(0.2, currentTime + 0.05);
    bell2Gain.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.25);
    bell2.connect(bell2Gain);
    bell2Gain.connect(ctx.destination);
    bell2.start(currentTime + 0.05);
    bell2.stop(currentTime + 0.25);

    // Mechanical click sound
    const click = ctx.createOscillator();
    const clickGain = ctx.createGain();
    const clickFilter = ctx.createBiquadFilter();
    click.type = 'square';
    click.frequency.setValueAtTime(40, currentTime);
    clickFilter.type = 'highpass';
    clickFilter.frequency.setValueAtTime(1000, currentTime);
    clickGain.gain.setValueAtTime(0.1, currentTime);
    clickGain.gain.exponentialRampToValueAtTime(0.001, currentTime + 0.02);
    click.connect(clickFilter);
    clickFilter.connect(clickGain);
    clickGain.connect(ctx.destination);
    click.start(currentTime);
    click.stop(currentTime + 0.02);

    // Drawer opening sound (swoosh)
    const drawer = ctx.createOscillator();
    const drawerGain = ctx.createGain();
    const drawerFilter = ctx.createBiquadFilter();
    drawer.type = 'sawtooth';
    drawer.frequency.setValueAtTime(100, currentTime + 0.1);
    drawer.frequency.exponentialRampToValueAtTime(50, currentTime + 0.3);
    drawerFilter.type = 'bandpass';
    drawerFilter.frequency.setValueAtTime(800, currentTime + 0.1);
    drawerFilter.Q.setValueAtTime(5, currentTime + 0.1);
    drawerGain.gain.setValueAtTime(0, currentTime + 0.1);
    drawerGain.gain.linearRampToValueAtTime(0.05, currentTime + 0.15);
    drawerGain.gain.linearRampToValueAtTime(0, currentTime + 0.3);
    drawer.connect(drawerFilter);
    drawerFilter.connect(drawerGain);
    drawerGain.connect(ctx.destination);
    drawer.start(currentTime + 0.1);
    drawer.stop(currentTime + 0.3);

    // Coins jingling
    for (let i = 0; i < 5; i++) {
      const coin = ctx.createOscillator();
      const coinGain = ctx.createGain();
      const coinFilter = ctx.createBiquadFilter();
      const startTime = currentTime + 0.2 + (i * 0.03);
      
      coin.frequency.setValueAtTime(2000 + (Math.random() * 1000), startTime);
      coin.frequency.exponentialRampToValueAtTime(1000 + (Math.random() * 500), startTime + 0.05);
      
      coinFilter.type = 'bandpass';
      coinFilter.frequency.setValueAtTime(3000, startTime);
      coinFilter.Q.setValueAtTime(10, startTime);
      
      coinGain.gain.setValueAtTime(0.02, startTime);
      coinGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.05);
      
      coin.connect(coinFilter);
      coinFilter.connect(coinGain);
      coinGain.connect(ctx.destination);
      
      coin.start(startTime);
      coin.stop(startTime + 0.05);
    }

  } catch (error) {
    console.error('Erro ao tocar som de caixa registradora:', error);
  }
}

// Alternative simpler cash register sound
export function playSimpleCashSound() {
  try {
    const ctx = getAudioContext();
    const currentTime = ctx.currentTime;

    // Single bell ding
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.frequency.setValueAtTime(880, currentTime); // A5 note
    oscillator.frequency.exponentialRampToValueAtTime(440, currentTime + 0.2); // A4 note
    
    gainNode.gain.setValueAtTime(0.5, currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.5);
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.start(currentTime);
    oscillator.stop(currentTime + 0.5);

  } catch (error) {
    console.error('Erro ao tocar som:', error);
  }
}

// Money counting sound effect
export function playMoneyCountingSound() {
  try {
    const ctx = getAudioContext();
    const currentTime = ctx.currentTime;

    // Multiple quick beeps simulating money counting
    for (let i = 0; i < 4; i++) {
      const beep = ctx.createOscillator();
      const beepGain = ctx.createGain();
      const startTime = currentTime + (i * 0.08);
      
      beep.frequency.setValueAtTime(600 + (i * 100), startTime);
      beepGain.gain.setValueAtTime(0.1, startTime);
      beepGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.05);
      
      beep.connect(beepGain);
      beepGain.connect(ctx.destination);
      
      beep.start(startTime);
      beep.stop(startTime + 0.05);
    }

    // Final confirmation beep
    const confirm = ctx.createOscillator();
    const confirmGain = ctx.createGain();
    confirm.frequency.setValueAtTime(1000, currentTime + 0.4);
    confirmGain.gain.setValueAtTime(0.2, currentTime + 0.4);
    confirmGain.gain.exponentialRampToValueAtTime(0.001, currentTime + 0.6);
    confirm.connect(confirmGain);
    confirmGain.connect(ctx.destination);
    confirm.start(currentTime + 0.4);
    confirm.stop(currentTime + 0.6);

  } catch (error) {
    console.error('Erro ao tocar som de contagem:', error);
  }
}

// Check if sound is enabled (from settings)
export function isSoundEnabled(): boolean {
  // Check app-settings first (from header)
  const appSettings = localStorage.getItem('app-settings');
  if (appSettings) {
    try {
      const parsed = JSON.parse(appSettings);
      if (typeof parsed.soundEnabled === 'boolean') {
        return parsed.soundEnabled;
      }
    } catch {}
  }
  
  // Check system_config (from admin panel)
  const systemConfig = localStorage.getItem('system_config');
  if (systemConfig) {
    try {
      const parsed = JSON.parse(systemConfig);
      if (parsed.notifications?.enableSound !== undefined) {
        return parsed.notifications.enableSound;
      }
    } catch {}
  }
  
  return true; // Default to enabled
}

// Play sound with settings check
export function playSaleSound() {
  if (isSoundEnabled()) {
    playCashRegisterSound();
  }
}