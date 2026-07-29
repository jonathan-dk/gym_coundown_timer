import { useEffect, useState } from 'react'
import './CoinsInput.css'

type CoinsInputProps = {
  value: number
  onChange: (value: number) => void
}

export function CoinsInput({ value, onChange }: CoinsInputProps) {
  const [inputValue, setInputValue] = useState(String(value))

  useEffect(() => {
    setInputValue(String(value))
  }, [value])

  return (
    <label className="input-row horizontal coins-input">
      <span>Coins earned today:</span>
      <input
        type="number"
        min={0}
        value={inputValue}
        onChange={(e) => {
          const newValue = e.target.value
          setInputValue(newValue)
          if (newValue !== '') {
            onChange(Math.max(0, parseInt(newValue, 10) || 0))
          }
        }}
        onBlur={() => {
          if (inputValue === '') {
            setInputValue('0')
            onChange(0)
          }
        }}
      />
    </label>
  )
}
