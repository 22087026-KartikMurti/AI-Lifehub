interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'none'
  loading?: boolean
}

export default function Button({ 
  children, 
  variant = 'none', // default is none but can be changed using variant=... when called
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