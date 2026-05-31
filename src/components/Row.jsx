

export default function Row({ letters = [], correct = [] }) {
  return (
    <div className="flex justify-center m-2">
      {letters.map((letter, i) => (
        <div key={i} className={`w-16 h-16 border-2 border-gray-500 text-white text-2xl font-bold flex items-center justify-center m-1
          ${correct[i] === 'correct' ? 'bg-green-500'
          : correct[i] === 'wrong-position' ? 'bg-yellow-500'
          : correct[i] === 'wrong' ? 'bg-red-500'
          : 'bg-gray-500'}`}>
          {letter}
        </div>
      ))}
    </div>
  )
}