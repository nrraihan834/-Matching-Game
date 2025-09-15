/** @jsx React.createElement */
const { useState, useEffect, useMemo } = React;

const PAIRS = [
  { id: 'A', label: '🧠' },
  { id: 'B', label: '🔮' },
  { id: 'C', label: '✨' },
];

function shuffle(arr){
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function useToast(){
  const [msg, setMsg] = useState(null);
  useEffect(()=>{
    if(!msg) return;
    const t = setTimeout(()=> setMsg(null), 900);
    return () => clearTimeout(t);
  }, [msg]);
  return [msg, setMsg];
}

function Card({ value, index, flipped, matched, locked, onFlip }){
  const className = [
    'card',
    flipped ? 'flipped': '',
    matched ? 'matched': '',
    locked ? 'locked': ''
  ].join(' ');
  return (
    <div className={className} onClick={() => onFlip(index)} role="button" aria-label="card">
      <div className="card-inner">
        <div className="face front">?</div>
        <div className="face back">{value.label}</div>
      </div>
    </div>
  );
}

function App(){
  const baseDeck = useMemo(() => {
    const doubled = PAIRS.flatMap(p => [ { ...p }, { ...p } ]);
    return doubled.map((p, idx) => ({ ...p, key: idx }));
  }, []);

  const [deck, setDeck] = useState(() => shuffle(baseDeck));
  const [flipped, setFlipped] = useState([]);    // indices
  const [matched, setMatched] = useState([]);    // indices
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [scorePulse, setScorePulse] = useState(false);
  const [toast, setToast] = useToast();

  function flip(index){
    if (gameOver) return;
    if (flipped.includes(index) || matched.includes(index)) return;
    if (flipped.length === 2) return;
    setFlipped(prev => [...prev, index]);
  }

  useEffect(() => {
    if (flipped.length !== 2) return;
    const [i, j] = flipped;
    const a = deck[i];
    const b = deck[j];

    if (a.id === b.id){
      // MATCH ✅
      setMatched(prev => [...prev, i, j]);
      setScore(prev => prev + 10);
      setScorePulse(true);
      setToast('Wizard 🦐 Upward! +10');
      const t = setTimeout(()=> setScorePulse(false), 900);
      setFlipped([]);
      return () => clearTimeout(t);
    } else {
      // NO MATCH ❌
      const t = setTimeout(()=> setFlipped([]), 850);
      return () => clearTimeout(t);
    }
  }, [flipped, deck]);

  useEffect(() => {
    if (matched.length && matched.length === deck.length){
      setTimeout(()=> setGameOver(true), 300);
    }
  }, [matched, deck.length]);

  function restart(){
    setDeck(shuffle(baseDeck));
    setFlipped([]);
    setMatched([]);
    setScore(0);
    setGameOver(false);
    setToast(null);
  }

  return (
    <div className="app">
      <div className="header">
        <div className="title">Matching Game — Congress Mage</div>
        <div className="badge">Pairs: 3 • Cards: 6</div>
      </div>

      <div className="controls">
        <button onClick={restart}>Restart</button>
        <div className="score">
          Score: {score}
          {scorePulse && <span className="score-bubble">+10</span>}
        </div>
      </div>

      <div className="board">
        {deck.map((card, idx) => (
          <Card
            key={idx}
            value={card}
            index={idx}
            flipped={flipped.includes(idx)}
            matched={matched.includes(idx)}
            locked={flipped.length===2 && !flipped.includes(idx)}
            onFlip={flip}
          />
        ))}
      </div>

      {toast && (
        <div className="toast" aria-live="polite">
          <span>🧙‍♂️</span> Wizard <span>🦐</span> Upward! <strong>+10</strong>
        </div>
      )}

      {gameOver && (
        <div className="modal">
          <div className="modal-card">
            <div style={{fontSize: 36}}>🎉</div>
            <div className="modal-title">Congress Mage!</div>
            <div className="modal-sub">You win. Final Score: <strong>{score}</strong></div>
            <div className="footer">
              <button onClick={restart}>Play Again</button>
            </div>
            <div className="small" style={{marginTop:12}}>Tip: Match a pair to see the <em>Wizard 🦐 Upward</em> toast.</div>
          </div>
        </div>
      )}
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App/>);