/**********************************************
 * STARTER CODE
 **********************************************/

/**
 * shuffle()
 * Shuffle the contents of an array
 *   depending the datatype of the source
 * Makes a copy. Does NOT shuffle the original.
 * Based on Steve Griffith's array shuffle prototype
 * @Parameters: Array or string
 * @Return: Scrambled Array or string, based on the provided parameter
 */
function shuffle (src) {
  const copy = [...src]

  const length = copy.length
  for (let i = 0; i < length; i++) {
    const x = copy[i]
    const y = Math.floor(Math.random() * length)
    const z = copy[y]
    copy[i] = z
    copy[y] = x
  }

  if (typeof src === 'string') {
    return copy.join('')
  }

  return copy
}

/**********************************************
 * YOUR CODE BELOW
 **********************************************/

const { useState, useEffect } = React;

// The master list of words used in the game.
// This never changes - it's just used to reset the game.
const WORD_LIST = [
  "react", "scramble", "javascript", "component", "function",
  "variable", "keyboard", "developer", "internet", "computer",
  "application", "storage"
];

const MAX_STRIKES = 5;
const MAX_PASSES = 3;

// Helper that reads any saved game state out of localStorage.
// If nothing is saved yet (first visit), it builds a brand new game.
function loadGameState() {
  const saved = localStorage.getItem("scrambleGameState");

  if (saved) {
    return JSON.parse(saved);
  }

  const shuffledWords = shuffle(WORD_LIST);

  return {
    remainingWords: shuffledWords,
    currentWord: shuffledWords[0],
    scrambledWord: shuffle(shuffledWords[0]),
    points: 0,
    strikes: 0,
    passesLeft: MAX_PASSES,
    message: "",
    gameOver: false
  };
}

function Scramble() {
  const [gameState, setGameState] = useState(loadGameState);
  const [guess, setGuess] = useState("");

  // Whenever gameState changes, save it to localStorage
  // so progress survives a page refresh.
  useEffect(() => {
    localStorage.setItem("scrambleGameState", JSON.stringify(gameState));
  }, [gameState]);

  function handleGuessChange(event) {
    setGuess(event.target.value);
  }

  function handleGuessSubmit(event) {
    // Prevent the form from refreshing the page
    event.preventDefault();

    if (gameState.gameOver || guess.trim() === "") {
      return;
    }

    const isCorrect = guess.trim().toLowerCase() === gameState.currentWord.toLowerCase();

    if (isCorrect) {
      const newRemainingWords = gameState.remainingWords.slice(1);
      const newPoints = gameState.points + 1;

      if (newRemainingWords.length === 0) {
        // Player guessed every word - game over, they win!
        setGameState({
          ...gameState,
          remainingWords: newRemainingWords,
          points: newPoints,
          message: "Correct! You guessed every word - you win!",
          gameOver: true
        });
      } else {
        const nextWord = newRemainingWords[0];
        setGameState({
          ...gameState,
          remainingWords: newRemainingWords,
          currentWord: nextWord,
          scrambledWord: shuffle(nextWord),
          points: newPoints,
          message: "Correct!"
        });
      }
    } else {
      const newStrikes = gameState.strikes + 1;

      if (newStrikes >= MAX_STRIKES) {
        setGameState({
          ...gameState,
          strikes: newStrikes,
          message: "Incorrect! You've reached the max number of strikes. Game over!",
          gameOver: true
        });
      } else {
        setGameState({
          ...gameState,
          strikes: newStrikes,
          message: "Incorrect, try again!"
        });
      }
    }

    // Clear the textbox after every guess
    setGuess("");
  }

  function handlePass() {
    if (gameState.gameOver || gameState.passesLeft <= 0) {
      return;
    }

    const newRemainingWords = gameState.remainingWords.slice(1);

    if (newRemainingWords.length === 0) {
      setGameState({
        ...gameState,
        remainingWords: newRemainingWords,
        passesLeft: gameState.passesLeft - 1,
        message: "Passed! No words left - game over!",
        gameOver: true
      });
    } else {
      const nextWord = newRemainingWords[0];
      setGameState({
        ...gameState,
        remainingWords: newRemainingWords,
        currentWord: nextWord,
        scrambledWord: shuffle(nextWord),
        passesLeft: gameState.passesLeft - 1,
        message: "Passed!"
      });
    }

    setGuess("");
  }

  function handlePlayAgain() {
    const shuffledWords = shuffle(WORD_LIST);

    setGameState({
      remainingWords: shuffledWords,
      currentWord: shuffledWords[0],
      scrambledWord: shuffle(shuffledWords[0]),
      points: 0,
      strikes: 0,
      passesLeft: MAX_PASSES,
      message: "",
      gameOver: false
    });

    setGuess("");
  }

  return (
    <div className="scramble-container">
      <h1>Scramble</h1>

      <div className="stats">
        <span>Points: {gameState.points}</span>
        <span>Strikes: {gameState.strikes} / {MAX_STRIKES}</span>
        <span>Passes Left: {gameState.passesLeft}</span>
      </div>

      {!gameState.gameOver && (
        <div>
          <h2 className="scrambled-word">{gameState.scrambledWord}</h2>

          <form onSubmit={handleGuessSubmit}>
            <input
              type="text"
              value={guess}
              onChange={handleGuessChange}
              placeholder="Type your guess..."
              autoFocus
            />
          </form>

          <button
            onClick={handlePass}
            disabled={gameState.passesLeft <= 0}
          >
            Pass
          </button>

          {gameState.message && <p className="message">{gameState.message}</p>}
        </div>
      )}

      {gameState.gameOver && (
        <div>
          <p className="message">{gameState.message}</p>
          <p>Final Score: {gameState.points} points, {gameState.strikes} strikes</p>
          <button onClick={handlePlayAgain}>Play Again</button>
        </div>
      )}
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<Scramble />);