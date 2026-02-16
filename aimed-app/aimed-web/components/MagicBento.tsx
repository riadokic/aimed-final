import React, { useRef, useState, useEffect } from 'react';

interface MagicBentoProps {
    children?: React.ReactNode;
    textAutoHide?: boolean;
    enableStars?: boolean;
    enableSpotlight?: boolean;
    enableBorderGlow?: boolean;
    enableTilt?: boolean;
    enableMagnetism?: boolean;
    clickEffect?: boolean;
    spotlightRadius?: number;
    particleCount?: number;
    glowColor?: string;
    disableAnimations?: boolean;
    className?: string;
}

const MagicBento: React.FC<MagicBentoProps> = ({
    children,
    textAutoHide = true,
    enableStars = false,
    enableSpotlight = true,
    enableBorderGlow = true,
    enableTilt = true,
    enableMagnetism = false,
    clickEffect = false,
    spotlightRadius = 360,
    particleCount = 12,
    glowColor = "132, 0, 255",
    disableAnimations = false,
    className = ""
}) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        const card = cardRef.current;
        if (!card || disableAnimations) return;

        const handleMouseMove = (e: MouseEvent) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            setMousePosition({ x, y });
        };

        const handleMouseEnter = () => setIsHovered(true);
        const handleMouseLeave = () => setIsHovered(false);

        card.addEventListener('mousemove', handleMouseMove);
        card.addEventListener('mouseenter', handleMouseEnter);
        card.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            card.removeEventListener('mousemove', handleMouseMove);
            card.removeEventListener('mouseenter', handleMouseEnter);
            card.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, [disableAnimations]);

    const spotlightStyle = enableSpotlight && isHovered ? {
        background: `radial-gradient(${spotlightRadius}px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(${glowColor}, 0.15), transparent 40%)`
    } : {};

    const borderGlowStyle = enableBorderGlow && isHovered ? {
        boxShadow: `0 0 20px rgba(${glowColor}, 0.3), inset 0 0 20px rgba(${glowColor}, 0.1)`
    } : {};

    return (
        <div
            ref={cardRef}
            className={`relative overflow-hidden transition-all duration-300 ${className}`}
            style={{
                ...borderGlowStyle,
                transform: enableTilt && isHovered
                    ? `perspective(1000px) rotateX(${(mousePosition.y - 150) / 30}deg) rotateY(${(mousePosition.x - 150) / 30}deg)`
                    : 'none'
            }}
        >
            {/* Spotlight overlay */}
            {enableSpotlight && (
                <div
                    className="absolute inset-0 pointer-events-none transition-opacity duration-300"
                    style={{
                        ...spotlightStyle,
                        opacity: isHovered ? 1 : 0
                    }}
                />
            )}

            {/* Border glow effect */}
            {enableBorderGlow && isHovered && (
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        background: `linear-gradient(90deg, transparent, rgba(${glowColor}, 0.2), transparent)`,
                        backgroundSize: '200% 100%',
                        animation: 'shimmer 2s infinite'
                    }}
                />
            )}

            {children}

            <style jsx>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
        </div>
    );
};

export default MagicBento;
