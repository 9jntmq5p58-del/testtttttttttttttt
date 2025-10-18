import React from 'react';

const GameEndModal = ({ gameStatus, winner, playerName, onReturnToLobby }) => {
  const getResultMessage = () => {
    switch (gameStatus) {
      case 'checkmate':
        return `Checkmate! ${winner} wins!`;
      case 'stalemate':
        return 'Game ended in stalemate!';
      case 'draw':
        return 'Game ended in a draw!';
      case 'resigned':
        return `${winner} wins by resignation!`;
      default:
        return 'Game over!';
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h1 style={styles.title}>Game Over</h1>
        <p style={styles.message}>{getResultMessage()}</p>
        <button onClick={onReturnToLobby} style={styles.button}>
          Return to Lobby
        </button>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000
  },
  modal: {
    backgroundColor: 'white',
    padding: '40px',
    borderRadius: '8px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
    maxWidth: '500px',
    width: '90%',
    textAlign: 'center'
  },
  title: {
    fontSize: '32px',
    marginBottom: '20px',
    color: '#333'
  },
  message: {
    fontSize: '24px',
    marginBottom: '30px',
    color: '#666'
  },
  button: {
    padding: '15px 40px',
    fontSize: '18px',
    backgroundColor: '#1976d2',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'background-color 0.3s'
  }
};

export default GameEndModal;
