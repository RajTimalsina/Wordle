import './App.css'
import { useState, useEffect } from 'react'

 function App  ()  {

  const [word, setWord] = useState(null)
  
useEffect(() => { 
  fetch('https://api.datamuse.com/words?sp=?????&max=500')
    .then(response => response.json())
    .then(data => {
      const randomIndex = Math.floor(Math.random() * data.length)
      setWord(data[randomIndex].word)
    })
    .catch(error => console.error('Error fetching word:', error))
}, [])
  

    
  return (
    <>
      <h1 className="text-3xl font-bold underline text-red-700">{word || 'loading..'}</h1>
      
    </>
  )
}

export default App
