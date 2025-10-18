import React, { useState, useEffect } from 'react';
import PlayerNameInput from './components/PlayerNameInput';
import Lobby from './components/Lobby';
import Game from './components/Game';
import useSocket from './hooks/useSocket';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState('nameInput');
  const [playerName, setPlayerName] = useState('');
  const [gameId, setGameId] = useState(null);
  const [playerColor, setPlayerColor] = useState(null);
  const [opponentName, setOpponentName] = useState(null);

  const socket = useSocket();

  useEffect(() => {
    if (!socket) return;

    // Listen for game-started event
    socket.on('game-started', (data) => {
      // Determine player color
      const myColor = data.white.socketId === socket.id ? 'white' : 'black';
      const opponent = myColor === 'white' ? data.black.name : data.white.name;

      setGameId(data.gameId);
      setPlayerColor(myColor);
      setOpponentName(opponent);
      setCurrentView('game');
    });

    return () => {
      socket.off('game-started');
    };
  }, [socket]);

  const handleNameSubmit = (name) => {
    setPlayerName(name);
    setCurrentView('lobby');
  };

  const handleReturnToLobby = () => {
    setGameId(null);
    setPlayerColor(null);
    setOpponentName(null);
    setCurrentView('lobby');

    if (socket) {
      socket.emit('get-lobby-list');
    }
  };

  return (
    <div className="App">
      {currentView === 'nameInput' && <PlayerNameInput onNameSubmit={handleNameSubmit} />}

      {currentView === 'lobby' && socket && (
        <Lobby socket={socket} playerName={playerName} />
      )}

      {currentView === 'game' && socket && gameId && playerColor && opponentName && (
        <Game
          socket={socket}
          playerName={playerName}
          gameId={gameId}
          playerColor={playerColor}
          opponentName={opponentName}
          onReturnToLobby={handleReturnToLobby}
        />
      )}
    </div>
  );
}

export default App;
