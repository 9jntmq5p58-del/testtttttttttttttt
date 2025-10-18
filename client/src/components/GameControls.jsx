import React, { useState } from 'react';

const GameControls = ({ onResign, onOfferDraw, gameStatus, drawOffered }) => {
  const [drawOfferSent, setDrawOfferSent] = useState(false);

  const handleResign = () => {
    if (window.confirm('Are you sure you want to resign?')) {
      onResign();
    }
  };

  const handleOfferDraw = () => {
    if (!drawOfferSent && !drawOffered) {
      onOfferDraw();
      setDrawOfferSent(true);
    }
  };

  const isGameOver = gameStatus !== 'playing';

  return (
    <div style={styles.container}>
      <button
        onClick={handleResign}
        disabled={isGameOver}
        style={{
          ...styles.button,
          ...styles.resignButton,
          ...(isGameOver ? styles.buttonDisabled : {})
        }}
      >
        Resign
      </button>
      <button
        onClick={handleOfferDraw}
        disabled={isGameOver || drawOfferSent || drawOffered}
        style={{
          ...styles.button,
          ...styles.drawButton,
          ...(isGameOver || drawOfferSent || drawOffered ? styles.buttonDisabled : {})
        }}
      >
        {drawOfferSent || drawOffered ? 'Draw Offered' : 'Offer Draw'}
      </button>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    padding: '10px'
  },
  button: {
    width: '100%',
    height: '40px',
    fontSize: '16px',
    fontWeight: 'bold',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'opacity 0.3s'
  },
  resignButton: {
    backgroundColor: '#d32f2f',
    color: 'white'
  },
  drawButton: {
    backgroundColor: '#1976d2',
    color: 'white'
  },
  buttonDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed'
  }
};

export default GameControls;
