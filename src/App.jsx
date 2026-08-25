import { GameHeader } from "./components/GameHeader"
import { Card } from "./components/Card";
import { useEffect, useState } from "react";
import { WinMessage } from "./components/WinMessage";






const getRandomPokemonSprite = async () => {
  const dexNumber = Math.floor(Math.random() * 1024) + 1
  const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${dexNumber}`);
  const data = await response.json();
  return data.sprites.other.showdown.front_default ?? data.sprites.front_default;
}


const populateCards = async () => {
    const pokemon = await Promise.all(
      Array.from({length: 8}, getRandomPokemonSprite)
    );
    
    const values = [...pokemon, ...pokemon];

    for (let i = values.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [values [i], values[j]] = [values[j], values[i]]
    }

    return values.map((value, index) => ({
      id: index, 
      value,
      isFlipped: false,
      isMatched: false,
    }))
  }

function App() {

const [cards, setCards] = useState([]);
const [flippedCards, setFlippedCards] = useState([]);
const [matchedCards, setMatchedCards] = useState([]);
const [score, setScore] = useState(0);
const [moves, setMoves] = useState(0);
const [isLocked, setIsLocked] = useState(false)

useEffect(() => {
  populateCards().then(setCards);

}, []);

const initializeGame = async () => {
  setCards([]);
  setIsLocked(false);
  setScore(0);
  setMoves(0);
  setMatchedCards([]);
  setFlippedCards([]);

  const newCards = await populateCards();
  setCards(newCards);
};

const handleCardClick = (card) => {
// Don't allow clicking if card is already flipped or matched
  if (card.isFlipped || card.isMatched || isLocked || flippedCards.length === 2) {
    return;
  }
  // Update cards flipped state
  const newCards = cards.map((c) => {
    if (c.id === card.id) {
      return {...c, isFlipped: true}
    } else {
      return c;
    }
  })

  setCards(newCards);

  const newFlippedCards = [...flippedCards, card.id]
  setFlippedCards(newFlippedCards);

  // Check for match if 2 cards are flipped

  if(flippedCards.length === 1) {
    setIsLocked(true);
    const firstCard = cards[flippedCards[0]];

    if (firstCard.value === card.value) {
      setTimeout(() => {
      setMatchedCards((prev) => [
        
          ...prev, 
          firstCard.id,
           card.id
      ])
      setScore((prev) => prev + 1);

   
  setCards((prev) => 
    prev.map((c) => {
    if (c.id === card.id || c.id === firstCard.id) {
      return {...c, isMatched: true}
    } else {
      return c;
    }
  }));
  setIsLocked(false);
  setFlippedCards([]);
}, 500);

    } else {
      setTimeout(() => {
         // Flip back card 1, card 2
      const flippedBackCards = newCards.map((c) => {
        if (newFlippedCards.includes(c.id)|| c.id === card.id) {
          return {...c, isFlipped: false}
        } else {
          return c;
        }
      })
      setCards(flippedBackCards);

      setIsLocked(false);
      setFlippedCards([]);
      }, 1000)
    }

    setMoves((prev) => prev + 1);
  }
}

const isGameComplete = cards.length > 0 && matchedCards.length === cards.length;


  return (
    
   <div className="app">
    <GameHeader score={score} moves={moves} onReset={initializeGame}/>
    {isGameComplete && <WinMessage moves={moves}/>}
    <div className="cards-grid">
      {cards.map((card) => (
        <Card key={card.id} card={card} onClick={handleCardClick}/>
      ))}
    </div>
   </div>
  )
}

export default App;
