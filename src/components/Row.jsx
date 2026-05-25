import { useEffect, useState, useRef } from "react";

export default function Row({ word }) {
    const [key, setKey] = useState([null, null, null, null, null]);
    const [correct, setCorrect] = useState([null, null, null, null, null]);

    const keyRef = useRef(key);
    const wordArrayRef = useRef([]);

    useEffect(() => { keyRef.current = key }, [key]);
    useEffect(() => {
        wordArrayRef.current = word ? word.toUpperCase().split('') : [];
    }, [word]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Backspace') {
                setKey(prevKey => {
                    const newKey = [...prevKey];
                    for (let i = newKey.length - 1; i >= 0; i--) {
                        if (newKey[i] !== null) {
                            newKey[i] = null;
                            break;
                        }
                    }
                    return newKey;
                });

            } else if (e.key.length === 1 && e.key.match(/[a-zA-Z]/)) {
                setKey(prevKey => {
                    const newKey = [...prevKey];
                    for (let i = 0; i < newKey.length; i++) {
                        if (newKey[i] === null) {
                            newKey[i] = e.key.toUpperCase();
                            break;
                        }
                    }
                    return newKey;
                });

            } else if (e.key === 'Enter') {
                const currentKey = keyRef.current;

                // don't submit if row isn't fully filled
                if (currentKey.includes(null)) return;

                const guess = currentKey.join('').toLowerCase();

                // check if it's a real word
                fetch(`https://api.datamuse.com/words?sp=${guess}&max=1`)
                    .then(res => res.json())
                    .then(data => {
                        if (data.length === 0 || data[0].word !== guess) {
                            alert('Not a valid word!'); // or shake animation later
                            return;
                        }
                        // valid word — now check correctness
                        const currentWord = wordArrayRef.current;
                        const newCorrect = currentKey.map((k, i) => {
                            if (k === currentWord[i]) return true;
                            if (currentWord.includes(k)) return 'wrong-position';
                            return false;
                        });
                        setCorrect(newCorrect);
                    })
                    .catch(() => alert('Could not validate word'));
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    return (
        <div className="flex justify-center m-2">
            {key.map((letter, i) => (
                <div key={i} className={`w-16 h-16 border-2 border-gray-500 text-white flex items-center justify-center m-1 
                    ${correct[i] === true ? 'bg-green-500'
                        : correct[i] === 'wrong-position' ? 'bg-yellow-500'
                            : correct[i] === false ? 'bg-red-500'
                                : 'bg-gray-500'}`}>
                    {letter}
                </div>
            ))}
        </div>
    );
}