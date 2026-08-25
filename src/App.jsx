import { GameHeader } from "./components/GameHeader"
import { Card } from "./components/Card";
import { useState } from "react";
import { WinMessage } from "./components/WinMessage";



const getRandomPokemonSprite = async () => {
  const dexNumber = Math.random * (1025 - 1 + 1) - 1
  const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${dexNumber}`);
  const data = await response.json;
  return data.sprites.other.showdown.front_default ?? data.sprites.front_default;
}


const cardValues = [
  "🍎",
  "🍌",
  "🍇",
  "🍊",
  "🍓",
  "🥝",
  "🍑",
  "🍒",
  "🍎",
  "🍌",
  "🍇",
  "🍊",
  "🍓",
  "🥝",
  "🍑",
  "🍒",
];

const createCards = () => {
  const shuffled = [...cardValues];

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled.map((value, index) => ({
    id: index,
    value,
    isFlipped: false,
    isMatched: false,
  }));
};

function App() {

const [cards, setCards] = useState(createCards);
const [flippedCards, setFlippedCards] = useState([]);
const [matchedCards, setMatchedCards] = useState([]);
const [score, setScore] = useState(0);
const [moves, setMoves] = useState(0);
const [isLocked, setIsLocked] = useState(false)

const initializeGame = () => {
  setCards(createCards());
  setIsLocked(false);
  setScore(0);
  setMoves(0);
  setMatchedCards([]);
  setFlippedCards([]);
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

const isGameComplete = matchedCards.length === cardValues.length;


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
