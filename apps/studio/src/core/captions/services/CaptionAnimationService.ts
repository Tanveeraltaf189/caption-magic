export type AnimationType =
  | 'fade-in'
  | 'slide-up'
  | 'slide-down'
  | 'slide-left'
  | 'slide-right'
  | 'bounce'
  | 'scale'
  | 'rotate'
  | 'typewriter'
  | 'wave'
  | 'shake'
  | 'flip'
  | 'pulse'
  | 'glow';

export interface AnimationConfig {
  type: AnimationType;
  duration: number; // milliseconds
  delay: number; // milliseconds
  easing: 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'linear';
  iterations: number;
  intensity: 'low' | 'medium' | 'high';
}

export interface CaptionWithAnimation {
  id: string;
  text: string;
  startTime: number;
  endTime: number;
  animation?: AnimationConfig;
  fontId?: string;
}

export class CaptionAnimationService {
  private defaultConfigs: Record<AnimationType, Partial<AnimationConfig>> = {
    'fade-in': { duration: 500, easing: 'ease-in' },
    'slide-up': { duration: 600, easing: 'ease-out' },
    'slide-down': { duration: 600, easing: 'ease-out' },
    'slide-left': { duration: 600, easing: 'ease-out' },
    'slide-right': { duration: 600, easing: 'ease-out' },
    bounce: { duration: 800, easing: 'ease-in-out' },
    scale: { duration: 500, easing: 'ease-in-out' },
    rotate: { duration: 700, easing: 'ease-in-out' },
    typewriter: { duration: 1500, easing: 'linear' },
    wave: { duration: 1000, easing: 'ease-in-out' },
    shake: { duration: 400, easing: 'ease-in-out' },
    flip: { duration: 600, easing: 'ease-in-out' },
    pulse: { duration: 1000, easing: 'ease-in-out', iterations: Infinity },
    glow: { duration: 800, easing: 'ease-in-out', iterations: Infinity },
  };

  // Get animation configuration
  getAnimationConfig(type: AnimationType, intensity: 'low' | 'medium' | 'high' = 'medium'): AnimationConfig {
    const base = this.defaultConfigs[type];
    const intensityMultiplier = intensity === 'low' ? 0.7 : intensity === 'high' ? 1.3 : 1;

    return {
      type,
      duration: (base.duration || 500) * intensityMultiplier,
      delay: 0,
      easing: base.easing || 'ease',
      iterations: base.iterations || 1,
      intensity,
    };
  }

  // Generate CSS keyframes for animation
  generateKeyframes(type: AnimationType, intensity: 'low' | 'medium' | 'high' = 'medium'): string {
    const intensityValue = intensity === 'low' ? 5 : intensity === 'high' ? 15 : 10;

    const keyframesMap: Record<AnimationType, string> = {
      'fade-in': `
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `,
      'slide-up': `
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(${intensityValue}px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `,
      'slide-down': `
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-${intensityValue}px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `,
      'slide-left': `
        @keyframes slideLeft {
          from { opacity: 0; transform: translateX(${intensityValue}px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `,
      'slide-right': `
        @keyframes slideRight {
          from { opacity: 0; transform: translateX(-${intensityValue}px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `,
      bounce: `
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          25% { transform: translateY(-${intensityValue}px); }
          50% { transform: translateY(0); }
          75% { transform: translateY(-${intensityValue / 2}px); }
        }
      `,
      scale: `
        @keyframes scale {
          from { opacity: 0; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1); }
        }
      `,
      rotate: `
        @keyframes rotate {
          from { opacity: 0; transform: rotate(-${intensityValue * 3}deg); }
          to { opacity: 1; transform: rotate(0deg); }
        }
      `,
      typewriter: `
        @keyframes typewriter {
          from { width: 0; }
          to { width: 100%; }
        }
      `,
      wave: `
        @keyframes wave {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-${intensityValue}px); }
        }
      `,
      shake: `
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(${intensityValue}px); }
          75% { transform: translateX(-${intensityValue}px); }
        }
      `,
      flip: `
        @keyframes flip {
          from { opacity: 0; transform: rotateY(90deg); }
          to { opacity: 1; transform: rotateY(0deg); }
        }
      `,
      pulse: `
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `,
      glow: `
        @keyframes glow {
          0%, 100% { text-shadow: 0 0 5px rgba(255, 255, 255, 0.5); }
          50% { text-shadow: 0 0 ${intensityValue}px rgba(255, 255, 255, 1); }
        }
      `,
    };

    return keyframesMap[type];
  }

  // Apply animation to caption element
  applyCaptionAnimation(
    element: HTMLElement,
    animation: AnimationConfig
  ): void {
    const animationName = animation.type;
    const keyframes = this.generateKeyframes(animation.type, animation.intensity);

    // Inject keyframes
    const style = document.createElement('style');
    style.textContent = keyframes;
    document.head.appendChild(style);

    // Apply animation
    element.style.animation = `
      ${animationName}
      ${animation.duration}ms
      ${animation.easing}
      ${animation.delay}ms
      ${animation.iterations === Infinity ? 'infinite' : `${animation.iterations}`}
    `;
  }

  // Get all available animations
  getAvailableAnimations(): Array<{ type: AnimationType; label: string }> {
    return [
      { type: 'fade-in', label: 'Fade In' },
