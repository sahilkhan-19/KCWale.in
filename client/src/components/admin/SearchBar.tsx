import React, { useState, useEffect } from "react"
import { Search, X } from "lucide-react"

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder = "Search...",
}) => {
  const [localValue, setLocalValue] = useState(value)

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (localValue !== value) {
        onChange(localValue)
      }
    }, 400)
    return () => clearTimeout(timeout)
  }, [localValue])

  useEffect(() => {
    setLocalValue(value)
  }, [value])

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
      <input
        type="text"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-9 pr-8 py-2.5 bg-surface-container-low border border-outline-variant/30 text-on-surface rounded-xl focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm placeholder:text-on-surface-variant/60 transition-all"
      />
      {localValue && (
        <button
          onClick={() => {
            setLocalValue("")
            onChange("")
          }}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-surface-container text-on-surface-variant"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  )
}
