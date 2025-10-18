import React, { useState } from 'react';
import { Chessboard } from 'react-chessboard';

const ChessBoard = ({ fen, onMove, playerColor, game }) => {
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [squareStyles, setSquareStyles] = useState({});

  const onSquareClick = (square) => {
    if (!game) return;

    // Check if clicking on a piece or empty square
    const piece = game.get(square);

    if (selectedSquare) {
      // Already have a piece selected
      if (square === selectedSquare) {
        // Clicking on same square, deselect
        setSelectedSquare(null);
        setSquareStyles({});
      } else if (piece && isOwnPiece(piece)) {
        // Clicking on another own piece, select new piece
        selectSquare(square);
      } else {
        // Clicking on empty square or opponent piece, try to move
        const move = {
          from: selectedSquare,
          to: square,
          promotion: 'q' // Always promote to queen
        };

        const result = game.move(move);
        if (result) {
          onMove(move);
          setSelectedSquare(null);
          setSquareStyles({});
        }
      }
    } else {
      // No piece selected yet
      if (piece && isOwnPiece(piece)) {
        selectSquare(square);
      }
    }
  };

  const isOwnPiece = (piece) => {
    if (!game) return false;
    const currentTurn = game.turn();
    return (
      (playerColor === 'white' && currentTurn === 'w' && piece.color === 'w') ||
      (playerColor === 'black' && currentTurn === 'b' && piece.color === 'b')
    );
  };

  const selectSquare = (square) => {
    if (!game) return;

    setSelectedSquare(square);

    // Get legal moves for this square
    const moves = game.moves({ square, verbose: true });

    // Generate highlight styles
    const newSquareStyles = {};

    moves.forEach((move) => {
      const isCapture = move.captured !== undefined;
      newSquareStyles[move.to] = {
        backgroundColor: isCapture
          ? 'rgba(255, 0, 0, 0.4)'
          : 'rgba(0, 255, 0, 0.4)',
        borderRadius: '50%'
      };
    });

    // Highlight selected square
    newSquareStyles[square] = {
      backgroundColor: 'rgba(255, 255, 0, 0.4)'
    };

    setSquareStyles(newSquareStyles);
  };

  const onPieceDrop = (sourceSquare, targetSquare) => {
    if (!game) return false;

    const move = {
      from: sourceSquare,
      to: targetSquare,
      promotion: 'q' // Always promote to queen
    };

    try {
      const result = game.move(move);

      if (result) {
        onMove(move);
        setSelectedSquare(null);
        setSquareStyles({});
        return true;
      }
    } catch (error) {
      // Invalid move
    }

    return false;
  };

  const isDraggablePiece = ({ piece }) => {
    if (!game) return false;

    const currentTurn = game.turn();

    // Check if it's player's turn and piece belongs to player
    if (playerColor === 'white' && currentTurn === 'w') {
      return piece[0] === 'w';
    } else if (playerColor === 'black' && currentTurn === 'b') {
      return piece[0] === 'b';
    }

    return false;
  };

  return (
    <div style={styles.container}>
      <Chessboard
        position={fen}
        onPieceDrop={onPieceDrop}
        onSquareClick={onSquareClick}
        customSquareStyles={squareStyles}
        boardOrientation={playerColor}
        isDraggablePiece={isDraggablePiece}
        boardWidth={600}
        customBoardStyle={{
          borderRadius: '4px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.3)'
        }}
        customLightSquareStyle={{ backgroundColor: '#f0d9b5' }}
        customDarkSquareStyle={{ backgroundColor: '#b58863' }}
      />
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  }
};

export default ChessBoard;
