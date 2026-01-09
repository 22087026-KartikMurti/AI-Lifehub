import { Moon, Sun } from 'lucide-react'
import { useTheme } from '@/src/components/Themes/ThemeProvider'
import Button from "@/src/components/Button"

export default function ThemeSwitcher() {
  const { theme, toggleTheme } = useTheme()

  return (
    <Button
      onClick={toggleTheme}
      className='
        flex items-center gap-3 px-4 py-3 mb-4 rounded-full text-gray-700 
        dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors
      '
    >
      {theme === 'light' ? <Moon aria-label='Moon symbol' size={20} /> : <Sun aria-label='Sun symbol' size={20} />}
    </Button>
  )
} 