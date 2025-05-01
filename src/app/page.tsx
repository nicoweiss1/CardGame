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
  const [spielerMussAussetzen, setSpielerMussAussetzen] = useState<string | null>(null);
  const [gewuenschtesSymbol, setGewuenschtesSymbol] = useState<string | null>(null);


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

  function karteSpielen(player: "player1" | "player2", card: Card) {
    if (!ablageKarte) return;
  
    if (player !== aktuellerSpieler) {
      alert("Du bist gerade nicht an der Reihe");
      return;
    }

    if (
      spielerMussAussetzen &&
      spielerMussAussetzen.includes(player === "player1" ? "Spieler 1" : "Spieler 2")
    ) {
      alert("Du musst aussetzen und darfst diese Runde nicht spielen.");
      return;
    }
  
    const istBube = card.value === "JACK";
    let darfLegen = false;
  
    // Wenn ein Wunsch aktiv ist (nach Bube)
    if (gewuenschtesSymbol) {
      darfLegen = card.suit === gewuenschtesSymbol || card.value === "JACK";
    } else {
      const gleichesSymbol = card.suit === ablageKarte.suit;
      const gleicherWert = card.value === ablageKarte.value;
      darfLegen = gleichesSymbol || gleicherWert || card.value === "JACK";
    }
  
    if (!darfLegen) {
      alert("Karte passt nicht zu Symbol oder Wert.");
      return;
    }
  
    // Ablage aktualisieren
    setAblageKarte(card);
  
    // Karte aus Hand entfernen
    if (player === "player1") {
      setPlayer1Cards(prev => prev.filter(c => c.code !== card.code));
    } else {
      setPlayer2Cards(prev => prev.filter(c => c.code !== card.code));
    }
  
    // 🧠 Hier wird die Aussetz-Meldung entfernt, wenn noch vorhanden
    if (spielerMussAussetzen) {
      setSpielerMussAussetzen(null);
    }
  
    // Sonderfall Bube → Symbolwahl anzeigen, kein Spielerwechsel
    if (istBube) {
      setGewuenschtesSymbol(null); // Menü aktivieren
      return;
    }
  
    if (gewuenschtesSymbol) {
      setGewuenschtesSymbol(null);
    }
  
    // Spezialregel: 7 → 2 Karten ziehen
    if (card.value === "7") {
      setMussZweiZiehen(true);
    } else {
      setMussZweiZiehen(false);
    }
  
   // Spezialregel: 8 → Nächster Spieler muss aussetzen, aber KEIN Spielerwechsel
    if (card.value === "8") {
      const naechsterSpieler = player === "player1" ? "player2" : "player1";
      setSpielerMussAussetzen(
        naechsterSpieler === "player1"
          ? "👤 Spieler 1 muss aussetzen!"
          : "👤 Spieler 2 muss aussetzen!"
      );
      setBereitsGezogen(false);
      return; // 👉 Kein Spielerwechsel!
    }
  
    // Spielerwechsel
    setAktuellerSpieler(player === "player1" ? "player2" : "player1");
    setBereitsGezogen(false);
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
    if (
      spielerMussAussetzen &&
      spielerMussAussetzen.includes(player === "player1" ? "Spieler 1" : "Spieler 2")
    ) {
      alert("Du musst aussetzen und darfst diese Runde nicht ziehen.");
      return;
    }

    const ziehAnzahl = mussZweiZiehen ? 2 : 1

    const res = await fetch(`https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=${ziehAnzahl}`) // Bringen genau 1 Karte mithilfe der deckId der API zu "res"
    const data = await res.json() // API antwort wird in ein JSON umgewandelt

    if(data.cards.length >= 1) { // Wenn in dem JSON genau 1 Karte ist:
      if (player === "player1") { // Wenn player gleich player1 ist
        setPlayer1Cards(prev => [...prev, ...data.cards]) // Karte wird zu "player1Cards" hinzugefügt
      }
      else { // hier einfach bei player2
        setPlayer2Cards(prev => [...prev, ...data.cards])
      }


      if (mussZweiZiehen) {
        setMussZweiZiehen(false); // Spezialregel beenden
        setBereitsGezogen(true); // Jetzt darf "Kann nicht" gedrückt werden
      } else {
        setBereitsGezogen(true);
      }
    }

  }

  function handleKannNicht() {
    if (spielerMussAussetzen) {
      setSpielerMussAussetzen(null); // Meldung verschwindet bei "Kann nicht"
    }
  
    const naechsterSpieler = aktuellerSpieler === "player1" ? "player2" : "player1";
    setAktuellerSpieler(naechsterSpieler);
    setBereitsGezogen(false);
  }
  




  return (
    <div className="flex min-h-screen bg-black text-white p-6 justify-center gap-8">
      {/* Spieler 1 (links) */}
      {gameStarted && (
        <div className="flex gap-4 flex-shrink-0">
          {Array.from({ length: Math.ceil(player1Cards.length / 5) }).map((_, spaltenIndex) => (
            <div key={spaltenIndex} className="flex flex-col gap-12 w-20">
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
      <div className="flex-1 flex flex-col items-center justify-center">
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
  
        {gameStarted && (
          <div className="flex flex-col items-center justify-center">
            {/* Aktueller Spieler */}
            <div className="mb-4 text-white font-bold text-lg text-center">
              {aktuellerSpieler === 'player1' ? '👤 Spieler 1 ist dran' : '👤 Spieler 2 ist dran'}
              {spielerMussAussetzen && (
                <div className="text-red-400 text-sm mt-1">{spielerMussAussetzen}</div>
              )}
            </div>
  
            {/* Der Tisch */}
            <div className="flex items-center justify-between w-[300px] h-[250px] bg-white rounded-xl shadow-lg p-4">
              {ablageKarte && (
                <img src={ablageKarte.image} alt={ablageKarte.code} className="w-24 h-auto" />
              )}
              <div 
                onClick={() => karteZiehen(aktuellerSpieler)}
                className="w-24 h-36 bg-gray-300 rounded-lg flex items-center justify-center cursor-pointer"
              >
                <p className="text-black font-bold">Deck</p>
              </div>
            </div>
  
            {/* Kann nicht-Button */}
            <button
              onClick={handleKannNicht}
              disabled={!bereitsGezogen}
              className={`mt-4 text-white font-bold py-2 px-4 rounded ${
                bereitsGezogen ? "bg-red-500 hover:bg-red-600" : "bg-gray-400"
              }`}
            >
              Kann nicht
            </button>
  
            {/* Pflichtziehen Hinweis */}
            {mussZweiZiehen && (
              <div className="mt-2 text-red-500 font-semibold">
                {aktuellerSpieler === 'player1' ? 'Spieler 1 muss 2 Karten ziehen!' : 'Spieler 2 muss 2 Karten ziehen!'}
              </div>
            )}
  
            {/* 🃏 Symbolauswahl nach Bube */}
            {ablageKarte?.value === "JACK" && gewuenschtesSymbol === null && (
              <div className="mt-6 text-black bg-green-300 p-4 rounded shadow text-center">
                <p className="mb-2 font-semibold">🃏 Du hast einen Buben gelegt! Wähle ein Symbol:</p>
                <div className="flex gap-4 justify-center">
                  {["HEARTS", "DIAMONDS", "CLUBS", "SPADES"].map((symbol) => (
                    <button
                      key={symbol}
                      onClick={() => {
                        setGewuenschtesSymbol(symbol);
                        setBereitsGezogen(false); // Spieler darf direkt danach legen
                      }}
                      className="bg-white text-black px-3 py-1 rounded hover:bg-gray-200"
                    >
                      {symbol === "HEARTS" && "♥ Herz"}
                      {symbol === "DIAMONDS" && "♦ Karo"}
                      {symbol === "CLUBS" && "♣ Kreuz"}
                      {symbol === "SPADES" && "♠ Pik"}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
  
      {/* Spieler 2 (rechts) */}
      {gameStarted && (
        <div className="flex gap-4 flex-shrink-0">
          {Array.from({ length: Math.ceil(player2Cards.length / 5) }).map((_, spaltenIndex) => (
            <div key={spaltenIndex} className="flex flex-col gap-12 w-20">
              {player2Cards
                .slice(spaltenIndex * 5, spaltenIndex * 5 + 5)
                .map((card) => (
                  <img
                    key={card.code}
                    src={card.image}
                    alt={card.code}
                    onClick={() => karteSpielen("player2", card)}
                    className="w-20 h-auto cursor-pointer"
                  />
                ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
  
}