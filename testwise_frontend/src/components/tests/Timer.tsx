import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';

interface TimerProps {
  seconds: number;
}

export default function Timer({ seconds }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(seconds);

  useEffect(() => {
    // Keep the local timer state in sync with the prop from the parent
    setTimeLeft(seconds);
  }, [seconds]);

  const minutes = Math.floor(timeLeft / 60);
  const remainingSeconds = timeLeft % 60;

  // Determine color based on time left
  const timeColor = timeLeft <= 60 ? 'text-destructive' : 'text-foreground';

  return (
    <div className={`flex items-center font-medium ${timeColor}`}>
      <Clock className="mr-2 h-4 w-4" />
      <span>
        {String(minutes).padStart(2, '0')}:{String(remainingSeconds).padStart(2, '0')}
      </span>
    </div>
  );
}