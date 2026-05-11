"use client"

import confetti from 'canvas-confetti';
import { Button } from '@/components/ui/button';

export function FlowerConfetti() {
  const handleConfetti = () => {
    const scalar = 5; // Very visible size
    const rose = confetti.shapeFromText({ text: '🌹', scalar });
    const flower = confetti.shapeFromText({ text: '🌸', scalar });
    const tulip = confetti.shapeFromText({ text: '🌷', scalar });

    const duration = 5 * 1000;
    const animationEnd = Date.now() + duration;

    (function frame() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) return;

      const particleCount = 1;
      
      confetti({
        particleCount,
        angle: 90,
        spread: 360,
        origin: { x: Math.random(), y: -0.2 }, // Falling from way above
        shapes: [rose, flower, tulip],
        scalar,
        gravity: 0.7,
        drift: Math.random() * 2 - 1,
        ticks: 200
      });

      requestAnimationFrame(frame);
    }());
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleConfetti}
      className="text-pink-500 hover:text-pink-600 hover:bg-pink-50 dark:hover:bg-pink-950 text-2xl"
      title="Kutlama yap! 🌹"
    >
      🌹
    </Button>
  );
}
