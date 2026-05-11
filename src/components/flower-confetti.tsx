"use client"

import confetti from 'canvas-confetti';
import { Button } from '@/components/ui/button';

export function FlowerConfetti() {
  const handleConfetti = () => {
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      
      // Flower shapes or colors
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        colors: ['#ff69b4', '#ff1493', '#ffc0cb', '#da70d6'],
        shapes: ['circle'], // We can simulate flowers with circles and colors
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        colors: ['#ff69b4', '#ff1493', '#ffc0cb', '#da70d6'],
        shapes: ['circle'],
      });
    }, 250);
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleConfetti}
      className="text-pink-500 hover:text-pink-600 hover:bg-pink-50 dark:hover:bg-pink-950 text-xl"
      title="Kutlama yap! 🌸"
    >
      🌸
    </Button>
  );
}
