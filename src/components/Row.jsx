

export default function Row({ letters = [], correct = [], isActive = false, isInvalid = false }) {
  return (
    <div className={`flex justify-center mb-1.5 ${isInvalid ? 'animate-shake' : ''}`}>
      {letters.map((letter, i) => {
        const isRevealed = correct[i] != null;
        
        let bgClass = 'bg-[var(--color-empty)] border-slate-700/50';
        let revealColor = '';
        let textClass = 'text-slate-100'
        
        if (isRevealed) {
           bgClass = correct[i] === 'correct' ? 'bg-[var(--color-correct)] border-[var(--color-correct)]'
            : correct[i] === 'wrong-position' ? 'bg-[var(--color-wrong-pos)] border-[var(--color-wrong-pos)]'
            : 'bg-[var(--color-wrong)] border-[var(--color-wrong)]';
            
           revealColor = correct[i] === 'correct' ? 'var(--color-correct)' 
            : correct[i] === 'wrong-position' ? 'var(--color-wrong-pos)' 
            : 'var(--color-wrong)';
        } else if (letter) {
           bgClass = 'bg-[var(--color-empty)] border-slate-500';
        }

        const animationClass = isRevealed 
          ? 'animate-reveal' 
          : (letter && isActive ? 'animate-pop' : '');
          
        return (
          <div 
            key={i} 
            className={`w-14 h-14 sm:w-16 sm:h-16 border-2 rounded-md ${textClass} text-3xl font-bold flex items-center justify-center mx-1 transition-colors duration-150 ${bgClass} ${animationClass}`}
            style={isRevealed ? { 
              animationDelay: `${i * 100}ms`, 
              '--reveal-bg': revealColor,
              backgroundColor: 'var(--color-empty)', 
              borderColor: 'transparent'
            } : {}}
          >
            {letter}
          </div>
        )
      })}
    </div>
  )
}