import { useEffect, useState } from 'react';

interface Props {
  texts: string[];
  speed?: number;
  deleteSpeed?: number;
  pauseTime?: number;
  className?: string;
}

const TypingEffect = ({ texts, speed = 50, deleteSpeed = 30, pauseTime = 2000, className }: Props) => {
  const [textIndex, setTextIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = texts[textIndex];

    if (!deleting && charIndex === current.length) {
      const timeout = setTimeout(() => setDeleting(true), pauseTime);
      return () => clearTimeout(timeout);
    }

    if (deleting && charIndex === 0) {
      setDeleting(false);
      setTextIndex((prev) => (prev + 1) % texts.length);
      return;
    }

    const timeout = setTimeout(() => {
      setCharIndex((prev) => prev + (deleting ? -1 : 1));
    }, deleting ? deleteSpeed : speed);

    return () => clearTimeout(timeout);
  }, [charIndex, deleting, textIndex, texts, speed, deleteSpeed, pauseTime]);

  return (
    <span className={className}>
      {texts[textIndex].slice(0, charIndex)}
      <span className="inline-block w-[2px] h-[1em] bg-primary ml-0.5 animate-[blink_1s_step-end_infinite] align-middle" />
    </span>
  );
};

export default TypingEffect;
