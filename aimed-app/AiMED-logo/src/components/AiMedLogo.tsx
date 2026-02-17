import React from 'react';
interface AiMedLogoProps extends React.SVGProps<SVGSVGElement> {
  variant?: 'full' | 'monogram';
  mode?: 'light' | 'dark';
}
export function AiMedLogo({
  variant = 'full',
  mode = 'light',
  className = '',
  ...props
}: AiMedLogoProps) {
  const fillColor = mode === 'light' ? '#000000' : '#FFFFFF';
  const lineColor = '#9CA3AF';
  if (variant === 'monogram') {
    return (
      <svg
        viewBox="0 0 100 100"
        className={`w-full h-full ${className}`}
        xmlns="http://www.w3.org/2000/svg"
        {...props}>

        <text
          x="50"
          y="72"
          textAnchor="middle"
          fontFamily="'Inter', sans-serif"
          fontWeight="900"
          fontSize="82"
          fill={fillColor}>

          A
        </text>
      </svg>);

  }
  return (
    <svg
      viewBox="0 0 340 80"
      className={`w-full h-full ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      {...props}>

      <text
        x="170"
        y="58"
        textAnchor="middle"
        fontFamily="'Inter', sans-serif"
        fontSize="62"
        fill={fillColor}>

        <tspan fontWeight="900">Ai</tspan>
        <tspan fontWeight="300">MED</tspan>
      </text>
    </svg>);

}