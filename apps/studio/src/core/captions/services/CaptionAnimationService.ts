export type AnimationType = 'fade-in' | 'slide-up' | 'bounce' | 'scale' | 'typewriter';

export interface AnimationConfig {
  type: AnimationType;
  duration: number;
  delay: number;
  easing: 'ease' | 'ease-in' | 'ease-out' | 'linear';
}

export class CaptionAnimationService {
  getAnimationConfig(type: AnimationType): AnimationConfig {
    return {
      type,
      duration: 500,
      delay: 0,
      easing: 'ease',
    };
  }

  getAvailableAnimations() {
    return [
      { type: 'fade-in', label: 'Fade In' },
      { type: 'slide-up', label: 'Slide Up' },
      { type: 'bounce', label: 'Bounce' },
      { type: 'scale', label: 'Scale' },
      { type: 'typewriter', label: 'Typewriter' },
    ];
  }
}
