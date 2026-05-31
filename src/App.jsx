import { useEffect, useState, useRef } from 'react'
import Row from './components/row'

export default function App() {
  const [word, setWord] = useState('')
  const [guesses, setGuesses] = useState(Array(6).fill(null)) // 6 submitted guesses
  const [currentInput, setCurrentInput] = useState(Array(5).fill(null)) // active row
  const [currentRow, setCurrentRow] = useState(0)
  const [gameOver, setGameOver] = useState(false)

  const wordRef = useRef(null)
  const currentInputRef = useRef(currentInput)
  const currentRowRef = useRef(currentRow)
  const gameOverRef = useRef(gameOver)

  useEffect(() => { wordRef.current = word }, [word])
  useEffect(() => { currentInputRef.current = currentInput }, [currentInput])
  useEffect(() => { currentRowRef.current = currentRow }, [currentRow])
  useEffect(() => { gameOverRef.current = gameOver }, [gameOver])

  // fetch word
  useEffect(() => {
    const loadWord = async () => {
      try {
        const res = await fetch('https://api.datamuse.com/words?sp=?????&max=500')
        const data = await res.json()
        if (!Array.isArray(data) || data.length === 0) {
          throw new Error('No words returned from dictionary API')
        }

        const random = data[Math.floor(Math.random() * data.length)]
        if (!random?.word) {
          throw new Error('Invalid word data from dictionary API')
        }

        setWord(random.word.toUpperCase())
      } catch (err) {
        console.error(err)
        setWord('REACT')
      }
    }

    loadWord()
  }, [])

  // keyboard handler
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (gameOverRef.current) return

      if (e.key === 'Backspace') {
        setCurrentInput(prev => {
          const next = [...prev]
          for (let i = next.length - 1; i >= 0; i--) {
            if (next[i] !== null) { next[i] = null; break }
          }
          return next
        })

      } else if (e.key.length === 1 && e.key.match(/[a-zA-Z]/)) {
        setCurrentInput(prev => {
          const next = [...prev]
          for (let i = 0; i < next.length; i++) {
            if (next[i] === null) { next[i] = e.key.toUpperCase(); break }
          }
          return next
        })

      } else if (e.key === 'Enter') {
        if (!wordRef.current) return

        const input = currentInputRef.current
        if (input.includes(null)) return

        const guess = input.join('').toLowerCase()

        fetch(`https://api.datamuse.com/words?sp=${guess}&max=1`)
          .then(res => res.json())
          .then(data => {
            if (data.length === 0 || data[0].word !== guess) {
              alert('Not a valid word!')
              return
            }

            const secretWord = wordRef.current.split('')
            const correct = input.map((k, i) => {
              if (k === secretWord[i]) return 'correct'
              if (secretWord.includes(k)) return 'wrong-position'
              return 'wrong'
            })

            const row = currentRowRef.current
            setGuesses(prev => {
              const next = [...prev]
              next[row] = { letters: input, correct }
              return next
            })

            setCurrentRow(row + 1)
            setCurrentInput(Array(5).fill(null))

            if (correct.every(c => c === 'correct')) {
              setGameOver(true)
              setTimeout(() => alert('You won! 🎉'), 100)
            } else if (row + 1 === 6) {
              setGameOver(true)
              setTimeout(() => alert(`Game over! The word was ${wordRef.current}`), 100)
            }
          })
          .catch(() => alert('Could not validate word'))
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  if (!word) {
    return (
      <div className="flex flex-col items-center mt-10 text-white">
        <h1 className="text-4xl font-bold mb-6">Wordle</h1>
        <p>Loading secret word…</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center mt-10">
      <h1 className="text-4xl font-bold text-white mb-6">Wordle</h1>
      {Array(6).fill(null).map((_, i) => (
        <Row
          key={i}
          letters={i === currentRow ? currentInput : (guesses[i]?.letters ?? Array(5).fill(null))}
          correct={guesses[i]?.correct ?? Array(5).fill(null)}
        />
      ))}
    </div>
  )
}