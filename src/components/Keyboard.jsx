import React from 'react'

const ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACKSPACE']
]

export default function Keyboard({ letterStatuses, onKeyPress }) {
  return (
    <div className="flex flex-col items-center w-full px-1">
      {ROWS.map((row, i) => (
        <div key={i} className="flex justify-center w-full mb-2">
          {row.map(key => {
            const status = letterStatuses[key]
            let bgClass = 'bg-slate-700 hover:bg-slate-600'
            let textClass = 'text-slate-100'

            if (status === 'correct') {
              bgClass = 'bg-[var(--color-correct)] hover:opacity-90'
            } else if (status === 'wrong-position') {
              bgClass = 'bg-[var(--color-wrong-pos)] hover:opacity-90'
            } else if (status === 'wrong') {
              bgClass = 'bg-[var(--color-wrong)] hover:opacity-90 text-slate-400'
            }

            const isActionKey = key.length > 1
            const keyLabel = key === 'BACKSPACE' ? '⌫' : (key === 'ENTER' ? 'ENTER' : key)

            return (
              <button
                key={key}
                onClick={() => onKeyPress(key)}
                className={`
                  ${isActionKey ? 'px-3 sm:px-4 text-xs sm:text-sm font-semibold tracking-wide' : 'w-8 h-12 sm:w-11 sm:h-14 text-sm sm:text-lg font-bold'} 
                  rounded-md
                  mx-0.5 
                  sm:mx-1
                  transition-colors
                  shadow-sm
                  ${bgClass} 
                  ${textClass}
                `}
              >
                {keyLabel}
              </button>
            )
          })}
        </div>
      ))}
    </div>
  )
}
