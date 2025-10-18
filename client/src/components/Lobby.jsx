import React, { useState, useEffect } from 'react';

const Lobby = ({ socket, playerName }) => {
  const [games, setGames] = useState([]);
  const [isWaiting, setIsWaiting] = useState(false);

  useEffect(() => {
    if (!socket) return;

    // Request initial lobby list
    socket.emit('get-lobby-list');

    // Listen for lobby updates
    socket.on('lobby-update', (data) => {
      setGames(data.games);
    });

    return () => {
      socket.off('lobby-update');
    };
  }, [socket]);

  const handleCreateGame = () => {
    if (!socket || isWaiting) return;

    socket.emit('create-game', { playerName });
    setIsWaiting(true);
  };

  const handleJoinGame = (gameId) => {
    if (!socket) return;

    socket.emit('join-game', { gameId, playerName });
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Chess Lobby</h1>
        {isWaiting ? (
          <div style={styles.waitingContainer}>
            <span style={styles.waitingText}>Waiting for opponent...</span>
            <div style={styles.spinner}></div>
          </div>
        ) : (
          <button onClick={handleCreateGame} style={styles.createButton}>
            Create Game
          </button>
        )}
      </div>

      <div style={styles.gamesList}>
        {games.length === 0 ? (
          <div style={styles.emptyMessage}>
            No games available. Create one!
          </div>
        ) : (
          games.map((game) => (
            <div key={game.gameId} style={styles.gameCard}>
              <div style={styles.gameInfo}>
                <div style={styles.creatorName}>{game.creatorName}</div>
                <div style={styles.waitingStatus}>Waiting for opponent...</div>
              </div>
              <button
                onClick={() => handleJoinGame(game.gameId)}
                style={styles.joinButton}
              >
                Join
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '20px',
    minHeight: '100vh',
    backgroundColor: '#f5f5f5'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  title: {
    margin: 0,
    color: '#333'
  },
  createButton: {
    padding: '10px 20px',
    fontSize: '16px',
    backgroundColor: '#1976d2',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  waitingContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  waitingText: {
    fontSize: '16px',
    color: '#666'
  },
  spinner: {
    width: '20px',
    height: '20px',
    border: '3px solid #f3f3f3',
    borderTop: '3px solid #1976d2',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  gamesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
  },
  emptyMessage: {
    textAlign: 'center',
    padding: '40px',
    fontSize: '18px',
    color: '#666',
    backgroundColor: 'white',
    borderRadius: '8px'
  },
  gameCard: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  gameInfo: {
    flex: 1
  },
  creatorName: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '5px'
  },
  waitingStatus: {
    fontSize: '14px',
    color: '#666'
  },
  joinButton: {
    padding: '10px 30px',
    fontSize: '16px',
    backgroundColor: '#4caf50',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  }
};

// Add keyframes for spinner animation
const styleSheet = document.styleSheets[0];
const keyframes = `
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
`;
styleSheet.insertRule(keyframes, styleSheet.cssRules.length);

export default Lobby;
