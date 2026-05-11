"use client"

import confetti from 'canvas-confetti';
import { Button } from '@/components/ui/button';

export function FlowerConfetti() {
  const handleConfetti = () => {
    const scalar = 3;
    const rose = confetti.shapeFromText({ text: '🌹', scalar });
    const flower = confetti.shapeFromText({ text: '🌸', scalar });
    const tulip = confetti.shapeFromText({ text: '🌷', scalar });

    const defaults = {
      spread: 360,
      ticks: 100,
      gravity: 0.5,
      decay: 0.94,
      startVelocity: 30,
      shapes: [rose, flower, tulip],
      scalar
    };

    function shoot() {
      confetti({
        ...defaults,
        particleCount: 40,
        origin: { x: Math.random(), y: Math.random() - 0.2 }
      });
    }

    // Shoot multiple times for a richer effect
    setTimeout(shoot, 0);
    setTimeout(shoot, 200);
    setTimeout(shoot, 400);
    setTimeout(shoot, 600);
    setTimeout(shoot, 800);
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
