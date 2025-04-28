'use client';

import { useState, useEffect } from 'react';

// Grundgerüst für eine Karte
interface Card {
  code: string; // id der jeweiligen Karte
  image: string; // Bild der jeweiligen Karte
  suit: string; // Symbol der jeweiligen Karte zum Beispiel Herz
  value: string; // Wert der jeweiligen Karte zum Beispiel 7 oder Queen

}

export default function CardGame() {
  const [deckId, setDeckId] = useState<string | null>(null); // speichert id des aktuellen Kartendecks
  const [loading, setLoading] = useState<boolean>(false); // speichert ob gerade spiel Button gedrückt wurde
  const [gameStarted, setGameStarted]= useState<boolean>(false); // speichert ob gerade Spiel gestartet wurde
  const [player1Cards, setPlayer1Cards] = useState<Card[]>([]); // speichert gezogene Karten von Player1
  const [player2Cards, setPlayer2Cards] = useState<Card[]>([]); // speichert gezogene Karten von Player 2
  const [ablageKarte, setAblageKarte] = useState<Card | null>(null); // speichert die Ablage Karte, Card ohne[] weil es nur eine AblageKarte gibt
  const [aktuellerSpieler, setAktuellerSpieler] = useState<"player1" | "player2">("player1"); // speichert welcher Spieler gerade drann ist am Anfang ist Spieler 1 dran
  const [bereitsGezogen, setBereitsGezogen] = useState<boolean>(false) // speichert ob Karte gezogen wurde
  const [mussZweiZiehen, setMussZweiZiehen] = useState<boolean>(false) // speichert ob spieler Zwei Karten ziehen muss

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

    const res = await fetch(`https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=11`); // Bringen das deck zu "res" mit der deckId
    const data = await res.json() // in "data" wird die Reponse also antwort von der API in ein json umgewandelt

    if (data.cards.length === 11) { // Wenn Anzahl Karten 10 ist dann:
      setPlayer1Cards(data.cards.slice(0, 5)); // "player1Cards" bekommt erste 5 Karten index 0-4
      setPlayer2Cards(data.cards.slice(5, 10)); // "player2Cards" bekommt letzte 5 Karten index 5-9
      setAblageKarte(data.cards[10]); // 11. Karte wird zu "ablageKarte" hinzugefügt
    }

    setLoading(false); // "loading" wird zu false
  }

  function karteSpielen(player: "player1" | "player2", card: Card) { // Player entweder Player 1 oder Player 2 je nach dem wird ja beim Aufruf bestummen und die Karte, die jeweils die Attribute vom interface Card hat
    if(!ablageKarte) return

    if (player !== aktuellerSpieler) { // Wenn Spieler nicht gleich aktueller Spieler ist dann:
      alert("Du bist gerade nicht an der Reihe") // alert dass man nicht dran ist
      return // Funktion wird beendet
    }

    const gleichesSymbol = card.suit === ablageKarte.suit // Prüfen ob Karte das gleiche Symbol hat wie auf dem Stapel die Karte
    const gleicherWert = card.value === ablageKarte.value // Prüfen ob Karte gleichen Wert hat wie auf dem Stapel die Karte

    if (gleichesSymbol || gleicherWert) { // Wenn "gleichesSymbol" oder "gleicherWert" true dann:
      setAblageKarte(card) // Karte wird zu "AblageKarte" hinzugefügt

      
    
      if (player === "player1"){
        setPlayer1Cards(prev => prev.filter(c => c.code !== card.code)) // c steht für alle Karten also ich enferne von allen Karten, die eine Karte, die du gerade gespielt hast
      }
      else {
        setPlayer2Cards(prev => prev.filter(c => c.code !== card.code)) // wir entfernen auch hier die von allen id's von den Karten, die id von der Karte, die gesetzt wurde einfach wenn player2 das gemacht hat
      }



      setAktuellerSpieler(player === "player1" ? "player2" : "player1") // wenn player gleich player 1 ist wird player 2 aktueller spieler, wenn nicht dann player1
      setBereitsGezogen(false) // "bereitsGezogen" wird auf falsch gesetzt

    }

    else {
      alert('Karte passt nicht')
    } 
  }

  async function karteZiehen(player: "player1" | "player2") {
    if (!deckId) return
    if (player !== aktuellerSpieler) { // Spieler nicht gleich aktueller Spieler ist dann diese Nachricht:
      alert("Du kannst gerade keine Karte ziehen, du bist nicht an der Reihe")
      return // Funktion wird beendet
    }
    if(bereitsGezogen) { // wenn "bereitsGezogen" true ist dann diese Nachricht:
      alert("Du hast schon eine Karte gezogen")
      return
    }

    const res = await fetch(`https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=1`) // Bringen genau 1 Karte mithilfe der deckId der API zu "res"
    const data = await res.json() // API antwort wird in ein JSON umgewandelt

    if(data.cards.length === 1) { // Wenn in dem JSON genau 1 Karte ist:
      if (player === "player1") { // Wenn player gleich player1 ist
        setPlayer1Cards(prev => [...prev, ...data.cards]) // Karte wird zu "player1Cards" hinzugefügt
      }
      else { // hier einfach bei player2
        setPlayer2Cards(prev => [...prev, ...data.cards])
      }
      setBereitsGezogen(true);
    }

  }

  function handleKannNicht() {
    setAktuellerSpieler(aktuellerSpieler === "player1" ? "player2" : "player1")
    setBereitsGezogen(false)
  }




  return (
    <div className="flex min-h-screen bg-black text-white p-6"> {/*p-6 innenabstand 6 also von aussen nach innen 6 abstand*, min-h-screen mindest höhe immer 100% des bildschirm, also egal wie wenig inhalt container immer 100% höhe des Bildschirms*/}

      {gameStarted && (
        <div className="flex gap-4 w-40 items-start justify-start">
          {Array.from({ length: Math.ceil(player1Cards.length / 5) }).map((_, spaltenIndex) => (
            <div key={spaltenIndex} className="flex flex-col gap-12">
              {player1Cards
                .slice(spaltenIndex * 5, spaltenIndex * 5 + 5)
                .map((card) => (
                  <img
                    key={card.code}
                    src={card.image}
                    alt={card.code}
                    onClick={() => karteSpielen("player1", card)}
                    className="w-20 h-auto cursor-pointer"
                  />
                ))}
            </div>
          ))}
        </div>
      )}

      {/* Spielfeld Mitte */}
      <div className="flex-1 flex flex-col items-center justify-center"> {/*flex-1 container dehnt sich so weit wie möglich aus, weil wir haben bei Spieler 1 und 2 eine Fest Breite w-32*/}
        {/* Vor Spielstart: Button */}
        {!gameStarted && (
          <>
            <h1 className="text-2xl font-bold mb-8">🎴 Zwei-Spieler-Kartenspiel – Mau Mau Basis - Laptop Layout</h1>
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
          <div className="flex flex-col items-center justify-center">
          {/* Anzeige aktueller Spieler */}
          <div className="mb-4 text-white font-bold text-lg">
            {aktuellerSpieler === 'player1' ? '👤 Spieler 1 ist dran (Karte klicken)' : '👤 Spieler 2 ist dran (Karte klicken)'}
          </div>
        
          {/* Der weiße Tisch */}
          <div className="flex items-center justify-between w-[300px] h-[250px] bg-white rounded-xl shadow-lg p-4">
            {/* Ablagekarte */}
            {ablageKarte && (
              <img src={ablageKarte.image} alt={ablageKarte.code} className="w-24 h-auto" />
            )}
            {/* Dummy Deck */}
            <div 
              onClick={() => karteZiehen(aktuellerSpieler)} // Beim Klicken des Ablagestapel wird Funktion "karteziehen" aufgerufen mit Argument aktueller Spieler
              className="w-24 h-36 bg-gray-300 rounded-lg flex items-center justify-center">
              <p className="text-black font-bold">Deck</p>
            </div>
          </div>

          <button
            onClick={handleKannNicht}
            disabled={!bereitsGezogen} // disabled wenn bereitsgezogen falsch ist
            className={`mt-4 text-white font-bold py-2 px-4 rounded ${
              bereitsGezogen ?
              "bg-red-500 hover:bg-red-600" :
              "bg-gray-400"
            }`}
          >
            Kann nicht
          </button>
        </div>
        )}
      </div>

      {/* Spieler 2 rechts */}
      {gameStarted && (
        <div className="flex gap-4 w-40 items-start justify-end">
          {Array.from({ length: Math.ceil(player2Cards.length / 5) }).map((_, spaltenIndex) => ( // *Array.from -> erzeugt ein Array, Math.ceil rundet immer auf heisst z.B 7 Karten durch 5 ergibt 1.4 rundet auf 2 auf, gehen mit map durch _ brauchen das Element selber nicht nur den index mit "spaltenindex" */}
            <div key={spaltenIndex} className="flex flex-col gap-12">
              {player2Cards
              .slice(spaltenIndex * 5, spaltenIndex * 5 + 5) // .slice bedeutet schneide ein Stück des Array von start, ende
              .map((card) => (
                <img 
                  key={card.code}
                  src={card.image}
                  alt={card.code} 
                  onClick={() => karteSpielen("player2", card)}
                  className="w-20 h-auto cursor-pointer"
                  />
              ))
              }
            </div>
          ))} 
         
        </div>
      )}
    </div>
  );
}