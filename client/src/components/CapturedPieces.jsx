import React from 'react';

const CapturedPieces = ({ pieces, playerColor }) => {
  // Unicode chess piece characters
  const pieceSymbols = {
    p: { white: '♙', black: '♟' },
    n: { white: '♘', black: '♞' },
    b: { white: '♗', black: '♝' },
    r: { white: '♖', black: '♜' },
    q: { white: '♕', black: '♛' },
    k: { white: '♔', black: '♚' }
  };

  // Sort pieces by value
  const pieceOrder = { p: 1, n: 2, b: 3, r: 4, q: 5, k: 6 };

  const sortedPieces = [...pieces].sort((a, b) => {
    return pieceOrder[a.type] - pieceOrder[b.type];
  });

  return (
    <div style={styles.container}>
      {sortedPieces.map((piece, index) => {
        const symbol = pieceSymbols[piece.type][piece.color];
        return (
          <span key={index} style={styles.piece}>
            {symbol}
          </span>
        );
      })}
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '5px',
    backgroundColor: '#f5f5f5',
    padding: '10px',
    minHeight: '40px',
    borderRadius: '4px',
    alignItems: 'center'
  },
  piece: {
    fontSize: '24px',
    lineHeight: '1'
  }
};

export default CapturedPieces;
