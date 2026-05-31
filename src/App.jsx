import { useEffect, useState, useRef } from 'react'
import Row from './components/Row'
import Keyboard from './components/Keyboard'

export default function App() {
  const [word, setWord] = useState('')
  const [guesses, setGuesses] = useState(Array(6).fill(null))
  const [currentInput, setCurrentInput] = useState(Array(5).fill(null))
  const [currentRow, setCurrentRow] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [gameWon, setGameWon] = useState(false)
  const [isInvalidRow, setIsInvalidRow] = useState(false)
  
  const [hint, setHint] = useState('')
  const [isLoadingHint, setIsLoadingHint] = useState(false)
  const [hintUsed, setHintUsed] = useState(false)

  const wordRef = useRef(null)
  const currentInputRef = useRef(currentInput)
  const currentRowRef = useRef(currentRow)
  const gameOverRef = useRef(gameOver)

  useEffect(() => { wordRef.current = word }, [word])
  useEffect(() => { currentInputRef.current = currentInput }, [currentInput])
  useEffect(() => { currentRowRef.current = currentRow }, [currentRow])
  useEffect(() => { gameOverRef.current = gameOver }, [gameOver])

  const initGame = async () => {
    setWord('')
    setGuesses(Array(6).fill(null))
    setCurrentInput(Array(5).fill(null))
    setCurrentRow(0)
    setGameOver(false)
    setGameWon(false)
    setHint('')
    setHintUsed(false)
    setIsInvalidRow(false)

    try {
      const res = await fetch('https://api.datamuse.com/words?sp=?????&max=500')
      const data = await res.json()
      if (!Array.isArray(data) || data.length === 0) throw new Error('No words')
      const random = data[Math.floor(Math.random() * data.length)]
      if (!random?.word) throw new Error('Invalid word')
      setWord(random.word.toUpperCase())
    } catch (err) {
      console.error(err)
      setWord('REACT')
    }
  }

  useEffect(() => {
    initGame()
  }, [])

  const handleKeyPress = (key) => {
    if (gameOverRef.current) return

    if (key === 'BACKSPACE' || key === 'Backspace') {
      setCurrentInput(prev => {
        const next = [...prev]
        for (let i = next.length - 1; i >= 0; i--) {
          if (next[i] !== null) { next[i] = null; break }
        }
        return next
      })
    } else if (key === 'ENTER' || key === 'Enter') {
      submitGuess()
    } else if (key.length === 1 && key.match(/[a-zA-Z]/)) {
      setCurrentInput(prev => {
        const next = [...prev]
        for (let i = 0; i < next.length; i++) {
          if (next[i] === null) { next[i] = key.toUpperCase(); break }
        }
        return next
      })
    }
  }

  const submitGuess = () => {
    if (!wordRef.current) return
    const input = currentInputRef.current
    if (input.includes(null)) return

    const guess = input.join('').toLowerCase()

    fetch(`https://api.datamuse.com/words?sp=${guess}&max=1`)
      .then(res => res.json())
      .then(data => {
        if (data.length === 0 || data[0].word !== guess) {
          triggerInvalidShake()
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
          setTimeout(() => {
            setGameWon(true)
            setGameOver(true)
          }, 1500)
        } else if (row + 1 === 6) {
          setTimeout(() => {
            setGameOver(true)
          }, 1500)
        }
      })
      .catch(() => triggerInvalidShake())
  }

  const triggerInvalidShake = () => {
    setIsInvalidRow(true)
    setTimeout(() => setIsInvalidRow(false), 400)
  }

  useEffect(() => {
    const handleKeyDown = (e) => handleKeyPress(e.key)
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleHint = async () => {
    if (gameOver || hintUsed || isLoadingHint) return
    setIsLoadingHint(true)
    try {
      const res = await fetch(`https://api.datamuse.com/words?sp=${wordRef.current}&md=d&max=1`)
      const data = await res.json()
      if (data && data.length > 0 && data[0].defs) {
        const defStr = data[0].defs[0].split('\t')[1] || data[0].defs[0]
        setHint(defStr)
        setHintUsed(true)
      } else {
        setHint("No definition found for this word.")
        setHintUsed(true)
      }
    } catch (e) {
      setHint("Failed to load hint.")
    }
    setIsLoadingHint(false)
  }

  const letterStatuses = {}
  guesses.forEach(g => {
    if (!g) return
    g.letters.forEach((l, i) => {
      if (l === '?') return
      const status = g.correct[i]
      if (status === 'correct') {
        letterStatuses[l] = 'correct'
      } else if (status === 'wrong-position' && letterStatuses[l] !== 'correct') {
        letterStatuses[l] = 'wrong-position'
      } else if (status === 'wrong' && letterStatuses[l] !== 'correct' && letterStatuses[l] !== 'wrong-position') {
        letterStatuses[l] = 'wrong'
      }
    })
  })

  if (!word) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[var(--color-brand-bg)]">
        <h1 className="text-4xl font-extrabold text-slate-100 mb-6 tracking-[0.2em]">WORDLE</h1>
        <p className="text-slate-400">Loading...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center py-2 h-screen max-h-screen relative overflow-hidden bg-[var(--color-brand-bg)]">
      <header className="flex justify-between items-center w-full max-w-md px-4 mb-2 border-b border-slate-700/50 pb-2">
        <button 
          onClick={handleHint}
          disabled={gameOver || hintUsed || isLoadingHint}
          className="text-slate-300 text-sm font-medium border border-slate-600 px-3 py-1.5 rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
        >
          {isLoadingHint ? '...' : 'Hint'}
        </button>
        <h1 className="text-3xl font-extrabold text-slate-100 tracking-[0.2em]">
          WORDLE
        </h1>
        <button onClick={initGame} className="text-slate-400 hover:text-slate-100 transition-colors" title="Restart">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </header>

      {hint && (
        <div className="w-full max-w-md px-4 mb-2 text-center text-sm font-medium text-amber-200/90 bg-slate-800/50 py-2.5 rounded-lg border border-slate-700/50 shadow-sm mx-2">
          💡 {hint}
        </div>
      )}

      <div className="flex flex-col flex-1 min-h-0 w-full max-w-md justify-center items-center">
        {Array(6).fill(null).map((_, i) => (
          <Row
            key={i}
            letters={i === currentRow ? currentInput : (guesses[i]?.letters ?? Array(5).fill(null))}
            correct={guesses[i]?.correct ?? Array(5).fill(null)}
            isActive={i === currentRow}
            isInvalid={i === currentRow && isInvalidRow}
          />
        ))}
      </div>

      <Keyboard letterStatuses={letterStatuses} onKeyPress={handleKeyPress} />

      {gameOver && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
          <div className="bg-slate-800 border border-slate-700 p-8 rounded-2xl flex flex-col items-center animate-pop max-w-sm w-full text-center shadow-2xl">
            <h2 className={`text-3xl font-bold mb-4 ${gameWon ? 'text-emerald-400' : 'text-rose-400'}`}>
              {gameWon ? 'You Won!' : 'Game Over'}
            </h2>
            {!gameWon && (
              <p className="text-slate-300 mb-6 text-lg">
                The word was: <span className="font-bold text-white tracking-widest">{wordRef.current}</span>
              </p>
            )}
            {gameWon && (
              <p className="text-slate-300 mb-6 text-lg">
                Guessed in <span className="font-bold text-white">{currentRow}</span> {currentRow === 1 ? 'try' : 'tries'}!
              </p>
            )}
            <button 
              onClick={initGame}
              className="bg-slate-100 text-slate-900 font-bold py-3 px-8 rounded-xl hover:bg-white transition-colors shadow-sm"
            >
              Play Again
            </button>
          </div>
        </div>
      )}
    </div>
  )
}