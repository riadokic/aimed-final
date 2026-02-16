import React, { useState, useEffect } from 'react';

interface TextTypeProps {
    texts: string[];
    typingSpeed?: number;
    deletingSpeed?: number;
    pauseDuration?: number;
    showCursor?: boolean;
    cursorCharacter?: string;
    cursorBlinkDuration?: number;
    variableSpeedEnabled?: boolean;
    variableSpeedMin?: number;
    variableSpeedMax?: number;
    className?: string;
}

const TextType: React.FC<TextTypeProps> = ({
    texts,
    typingSpeed = 75,
    deletingSpeed = 50,
    pauseDuration = 1500,
    showCursor = true,
    cursorCharacter = "_",
    cursorBlinkDuration = 0.5,
    variableSpeedEnabled = false,
    variableSpeedMin = 60,
    variableSpeedMax = 120,
    className = ""
}) => {
    const [currentTextIndex, setCurrentTextIndex] = useState(0);
    const [currentText, setCurrentText] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [isPaused, setIsPaused] = useState(false);

    useEffect(() => {
        const targetText = texts[currentTextIndex];

        if (isPaused) {
            const pauseTimeout = setTimeout(() => {
                setIsPaused(false);
                setIsDeleting(true);
            }, pauseDuration);
            return () => clearTimeout(pauseTimeout);
        }

        if (!isDeleting && currentText === targetText) {
            setIsPaused(true);
            return;
        }

        if (isDeleting && currentText === '') {
            setIsDeleting(false);
            setCurrentTextIndex((prev) => (prev + 1) % texts.length);
            return;
        }

        const getSpeed = () => {
            if (variableSpeedEnabled) {
                return Math.random() * (variableSpeedMax - variableSpeedMin) + variableSpeedMin;
            }
            return isDeleting ? deletingSpeed : typingSpeed;
        };

        const timeout = setTimeout(() => {
            if (isDeleting) {
                setCurrentText(targetText.substring(0, currentText.length - 1));
            } else {
                setCurrentText(targetText.substring(0, currentText.length + 1));
            }
        }, getSpeed());

        return () => clearTimeout(timeout);
    }, [currentText, isDeleting, isPaused, currentTextIndex, texts, typingSpeed, deletingSpeed, pauseDuration, variableSpeedEnabled, variableSpeedMin, variableSpeedMax]);

    return (
        <span className={className}>
            {currentText}
            {showCursor && (
                <span
                    className="inline-block"
                    style={{
                        animation: `blink ${cursorBlinkDuration}s infinite`
                    }}
                >
                    {cursorCharacter}
                </span>
            )}
            <style jsx>{`
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
      `}</style>
        </span>
    );
};

export default TextType;
