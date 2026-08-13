/**
 * GradientButton — a CTA with a continuously rotating gradient border.
 *
 * Props:
 *  - children  (ReactNode) — button content
 *  - width     (string)    — CSS width  (default '300px')
 *  - height    (string)    — CSS height (default '56px')
 *  - onClick   (function)  — click handler
 *  - disabled  (boolean)   — disabled state
 *  - className (string)    — extra classes
 */
export default function GradientButton({
  children,
  width = '300px',
  height = '56px',
  className = '',
  onClick,
  disabled = false,
  ...props
}) {
  const baseStyles = `
    relative rounded-[50px] cursor-pointer
    after:content-[""] after:block after:absolute after:bg-[var(--color-background)]
    after:inset-[3px] after:rounded-[47px] after:z-[1]
    after:transition-opacity after:duration-300 after:ease-linear
    flex items-center justify-center
    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
  `;

  const handleKeyDown = (e) => {
    if (disabled) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick?.();
    }
  };

  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      className={`${baseStyles} rotatingGradient ${className}`}
      style={{
        '--r': '0deg',
        minWidth: width,
        height: height,
      }}
      onClick={disabled ? undefined : onClick}
      onKeyDown={handleKeyDown}
      aria-disabled={disabled}
      {...props}
    >
      <span className="relative z-10 flex items-center justify-center text-[var(--color-text)] font-body font-semibold text-sm tracking-tight">
        {children}
      </span>
    </div>
  );
}
