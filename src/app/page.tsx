'use client';

import { useState, useEffect } from 'react';

// Grundgerüst für eine Karte
interface Card {
  code: string;
  image: string;
}

export default function CardGame() {
  const [deckId, setDeckId] = useState<string | null>(null); // speichert id des aktuellen Kartendecks
  const [player1Cards, setPlayer1Cards] = useState<Card[]>([]); // speichert gezogene Karten von Player1
  const [player2Cards, setPlayer2Cards] = useState<Card[]>([]); // speichert gezogene Karten von Player 2
  const [loading, setLoading] = useState<boolean>(false);
  const [gameStarted, setGameStarted]= useState<boolean>(false);
  

  // Neues Deck erstellen
  useEffect(() => {
    async function createDeck() {
      const res = await fetch('https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1');
      const data = await res.json();
      setDeckId(data.deck_id);
    }
    createDeck();
  }, []);

  // Spiel Starten, jeder bekommt 5 Karten
  async function startgame() { 
    if(!deckId) return; // wenn deckId null dann Funktionabruch
    setLoading(true); // loading zu true
    setGameStarted(true);

    const res = await fetch(`https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=10`); // Bringen das deck zu "res" mit der deckId
    const data = await res.json() // in "data" wird die Reponse also antwort von der API in ein json umgewandelt

    if (data.cards.length === 10) { // Wenn Anzahl Karten 10 ist dann:
      setPlayer1Cards(data.cards.slice(0, 5)); // "player1Cards" bekommt erste 5 Karten index 0-4
      setPlayer2Cards(data.cards.slice(5, 10)); // "player2Cards" bekommt letzte 5 Karten index 5-
    }

    setLoading(false); // "loading" wird zu false
  }

  return (
    <div className="flex min-h-screen bg-black text-white p-6">

      {/* Spieler 1 links */}
      {gameStarted && (
        <div className="flex flex-col items-center gap-4 w-32">
          <h2 className="text-xl font-semibold mb-4">👤 Spieler 1</h2>
          {player1Cards.map((card) => (
            <img key={card.code} src={card.image} alt={card.code} className="w-20 h-auto" />
          ))}
        </div>
      )}

      {/* Spielfeld Mitte */}
      <div className="flex-1 flex flex-col items-center justify-center">

        {/* Vor Spielstart: Button */}
        {!gameStarted && (
          <>
            <h1 className="text-2xl font-bold mb-8">🎴 Zwei-Spieler-Kartenspiel – Mau Mau Basis</h1>
            <button
              onClick={startgame}
              disabled={loading}
              className="bg-purple-600 text-white px-6 py-2 rounded-lg shadow-md hover:bg-purple-700 disabled:bg-gray-400"
            >
              {loading ? "Karten werden verteilt..." : "Spiel starten"}
            </button>
          </>
        )}

        {/* Nach Spielstart: Weißer Tisch */}
        {gameStarted && (
          <div className="w-[300px] h-[400px] bg-white rounded-xl shadow-lg flex items-center justify-center">
            {/* Platzhalter für später: Ablagestapel, Buttons, etc. */}
            <p className="text-black font-semibold">Tischbereich</p>
          </div>
        )}
      </div>

      {/* Spieler 2 rechts */}
      {gameStarted && (
        <div className="flex flex-col items-center gap-4 w-32">
          <h2 className="text-xl font-semibold mb-4">👤 Spieler 2</h2>
          {player2Cards.map((card) => (
            <img key={card.code} src={card.image} alt={card.code} className="w-20 h-auto" />
          ))}
        </div>
      )}
    </div>
  );
}