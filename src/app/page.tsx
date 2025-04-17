'use client';

import { useState, useEffect } from 'react';

interface Card {
  code: string;
  image: string;
}

export default function CardGame() {
  const [deckId, setDeckId] = useState<string | null>(null);
  const [player1Cards, setPlayer1Cards] = useState<Card[]>([]);
  const [player2Cards, setPlayer2Cards] = useState<Card[]>([]);
  const [loading1, setLoading1] = useState<boolean>(false);
  const [loading2, setLoading2] = useState<boolean>(false);

  // Neues Deck erstellen
  useEffect(() => {
    async function createDeck() {
      const res = await fetch('https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1');
      const data = await res.json();
      setDeckId(data.deck_id);
    }
    createDeck();
  }, []);

  // Karte für Spieler 1 ziehen
  async function drawCardForPlayer1() {
    if (!deckId) return;
    setLoading1(true);
    const res = await fetch(`https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=1`);
    const data = await res.json();
    if (data.cards.length > 0) {
      setPlayer1Cards((prevCards) => [...prevCards, ...data.cards]);
    }
    setLoading1(false);
  }

  // Karte für Spieler 2 ziehen
  async function drawCardForPlayer2() {
    if (!deckId) return;
    setLoading2(true);
    const res = await fetch(`https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=1`);
    const data = await res.json();
    if (data.cards.length > 0) {
      setPlayer2Cards((prevCards) => [...prevCards, ...data.cards]);
    }
    setLoading2(false);
  }

  return (
    <div className="flex flex-col items-center p-6 gap-12">
      <h1 className="text-2xl font-bold">🎴 Zwei-Spieler-Kartenziehen</h1>

      {/* Spieler 1 */}
      <div className="w-full max-w-4xl p-4 border rounded-xl shadow bg-white">
        <h2 className="text-xl font-semibold mb-2">👤 Spieler 1</h2>
        <button
          onClick={drawCardForPlayer1}
          disabled={loading1}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-600 disabled:bg-gray-400"
        >
          {loading1 ? 'Ziehen...' : 'Karte ziehen'}
        </button>
        <div className="grid grid-cols-4 gap-4 mt-4">
          {player1Cards.map((card) => (
            <img key={card.code} src={card.image} alt={card.code} className="w-24 h-auto" />
          ))}
        </div>
      </div>

      {/* Spieler 2 */}
      <div className="w-full max-w-4xl p-4 border rounded-xl shadow bg-white">
        <h2 className="text-xl font-semibold mb-2">👤 Spieler 2</h2>
        <button
          onClick={drawCardForPlayer2}
          disabled={loading2}
          className="bg-green-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-green-600 disabled:bg-gray-400"
        >
          {loading2 ? 'Ziehen...' : 'Karte ziehen'}
        </button>
        <div className="grid grid-cols-4 gap-4 mt-4">
          {player2Cards.map((card) => (
            <img key={card.code} src={card.image} alt={card.code} className="w-24 h-auto" />
          ))}
        </div>
      </div>
    </div>
  );
}