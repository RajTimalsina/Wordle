import './App.css'
import { useState, useEffect } from 'react'
import Row from './components/Row'

 function App  ()  {

  const [word, setWord] = useState(null)
  
useEffect(() => { 
  fetch('https://api.datamuse.com/words?sp=?????&max=500')
    .then(response => response.json())
    .then(data => {
      const randomIndex = Math.floor(Math.random() * data.length)
      setWord(data[randomIndex].word)
      console.log('Selected word:', data[randomIndex].word) 
    })
    .catch(error => console.error('Error fetching word:', error))
}, [])
  

    
  return (
    <>
    <div>
      <h1 className="text-3xl font-bold underline text-center m-10 text-white">Wordle</h1>
    </div>
    <div className="flex flex-col items-center">
      <Row word={word} />
  
    </div>

      
    </>
  )
}

export default App
