interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'none'
  loading?: boolean
}

/**
 * A reusable button component with preset style variants and loading state support.
 * 
 * @param variant - The visual style of the button ('primary' | 'secondary' | 'danger' | 'none')
 * @param loading - If true, shows "Loading..." text and disables the button
 * @param children - The button content (text, icons, etc.)
 * @param className - Additional Tailwind classes to customize styling
 * @param disabled - If true, disables the button
 * @param props - Any other valid HTML button attributes
 * 
 * @example
 * <Button variant="primary" onClick={handleClick}>
 *   Save Task
 * </Button>
 * 
 * @example
 * <Button variant="danger" loading={isDeleting}>
 *   Delete
 * </Button>
 */

export default function Button({ 
  children, 
  variant = 'none',
  loading, 
  className = '',
  disabled,
  ...props 
}: ButtonProps) {
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
    danger: 'text-red-600 hover:text-red-700',
    none: ''
  }

  return (
    <button
      className={`${variants[variant]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? 'Loading...' : children}
    </button>
  );
}