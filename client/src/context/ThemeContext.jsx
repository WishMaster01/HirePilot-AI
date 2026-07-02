import React, { useState } from 'react'
import { ThemeContext } from './themeContextValue'

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light')
  const toggleTheme = () => setTheme((value) => (value === 'light' ? 'dark' : 'light'))
  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>
}
