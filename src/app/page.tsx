'use client';

import { useState, useEffect } from 'react';

interface Card {
  code: string;
  image: string;
}

export default function CardGame() {
  const [deckId, setDeckId] = useState<string | null>(null);
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Neues Deck erstellen
  useEffect(() => {
    async function createDeck() {
      const res = await fetch('https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1');
      const data = await res.json();
      setDeckId(data.deck_id);
    }
    createDeck();
  }, []);

  // Karte ziehen
  async function drawCard() {
    if (!deckId) return;
    setLoading(true);
    const res = await fetch(`https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=1`);
    const data = await res.json();
    if (data.cards.length > 0) {
      setCards((prevCards) => [...prevCards, ...data.cards]);
    }
    setLoading(false);
  }

  return (
    <div className="flex flex-col items-center p-6">
      <h1 className="text-2xl font-bold mb-4">🎴 Karten ziehen</h1>
      <button 
        onClick={drawCard} 
        disabled={loading}
        className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-600 disabled:bg-gray-400"
      >
        {loading ? 'Ziehen...' : 'Karte ziehen'}
      </button>
      <div className="grid grid-cols-4 gap-4 mt-6">
        {cards.map((card) => (
          <img key={card.code} src={card.image} alt={card.code} className="w-24 h-auto" />
        ))}
      </div>
    </div>
  );
}