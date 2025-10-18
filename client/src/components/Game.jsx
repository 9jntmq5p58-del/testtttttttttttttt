import React, { useState, useEffect } from 'react';
import Chess from 'chess.js';
import ChessBoard from './ChessBoard';
import CapturedPieces from './CapturedPieces';
import Chat from './Chat';
import GameControls from './GameControls';
import GameEndModal from './GameEndModal';
import useSoundEffects from '../hooks/useSoundEffects';

const Game = ({ socket, playerName, gameId, playerColor, opponentName, onReturnToLobby }) => {
  const [game, setGame] = useState(new Chess());
  const [fen, setFen] = useState('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
  const [moveHistory, setMoveHistory] = useState([]);
  const [capturedPieces, setCapturedPieces] = useState({ white: [], black: [] });
  const [gameStatus, setGameStatus] = useState('playing');
  const [winner, setWinner] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [drawOffered, setDrawOffered] = useState(false);
  const [offeringPlayer, setOfferingPlayer] = useState(null);

  const { playMove, playCapture, playCheck, playGameEnd } = useSoundEffects();

  useEffect(() => {
    if (!socket) return;

    // Listen for move-made event
    socket.on('move-made', (data) => {
      const newGame = new Chess();
      newGame.load(data.fen);
      setGame(newGame);
      setFen(data.fen);
      setMoveHistory(data.moveHistory);
      calculateCapturedPieces(newGame);

      // Play appropriate sound
      if (data.isCheck) {
        playCheck();
      } else if (data.isCapture) {
        playCapture();
      } else {
        playMove();
      }
    });

    // Listen for game-over event
    socket.on('game-over', (data) => {
      setGameStatus(data.status);
      setWinner(data.winner);
      playGameEnd();
    });

    // Listen for chat messages
    socket.on('chat-message', (data) => {
      setChatMessages((prev) => [...prev, data]);
    });

    // Listen for draw offers
    socket.on('draw-offered', (data) => {
      setDrawOffered(true);
      setOfferingPlayer(data.offeringPlayer);
    });

    // Listen for draw declined
    socket.on('draw-declined', () => {
      alert('Your draw offer was declined.');
    });

    // Listen for opponent disconnected
    socket.on('opponent-disconnected', () => {
      setOpponentDisconnected(true);
      alert('Opponent disconnected. Returning to lobby.');
      setTimeout(() => {
        onReturnToLobby();
      }, 2000);
    });

    return () => {
      socket.off('move-made');
      socket.off('game-over');
      socket.off('chat-message');
      socket.off('draw-offered');
      socket.off('draw-declined');
      socket.off('opponent-disconnected');
    };
  }, [socket, game, playMove, playCapture, playCheck, playGameEnd, onReturnToLobby]);

  const calculateCapturedPieces = (chessGame) => {
    const board = chessGame.board();
    const startingPieces = {
      p: 8,
      n: 2,
      b: 2,
      r: 2,
      q: 1,
      k: 1
    };

    const currentPieces = {
      white: { p: 0, n: 0, b: 0, r: 0, q: 0, k: 0 },
      black: { p: 0, n: 0, b: 0, r: 0, q: 0, k: 0 }
    };

    // Count current pieces on board
    board.forEach((row) => {
      row.forEach((square) => {
        if (square) {
          currentPieces[square.color === 'w' ? 'white' : 'black'][square.type]++;
        }
      });
    });

    // Calculate captured pieces
    const capturedWhite = [];
    const capturedBlack = [];

    Object.keys(startingPieces).forEach((type) => {
      const whiteCount = startingPieces[type] - currentPieces.white[type];
      const blackCount = startingPieces[type] - currentPieces.black[type];

      for (let i = 0; i < whiteCount; i++) {
        capturedWhite.push({ type, color: 'white' });
      }

      for (let i = 0; i < blackCount; i++) {
        capturedBlack.push({ type, color: 'black' });
      }
    });

    setCapturedPieces({ white: capturedWhite, black: capturedBlack });
  };

  const handleMove = (move) => {
    if (!socket) return;

    socket.emit('make-move', { gameId, move });
  };

  const handleSendMessage = (message) => {
    if (!socket) return;

    socket.emit('send-message', { gameId, message });
  };

  const handleResign = () => {
    if (!socket) return;

    socket.emit('resign', { gameId });
  };

  const handleOfferDraw = () => {
    if (!socket) return;

    socket.emit('offer-draw', { gameId });
  };

  const handleRespondToDraw = (accept) => {
    if (!socket) return;

    socket.emit('respond-draw', { gameId, accept });
    setDrawOffered(false);
    setOfferingPlayer(null);
  };

  const isMyTurn = () => {
    const turn = game.turn();
    return (playerColor === 'white' && turn === 'w') || (playerColor === 'black' && turn === 'b');
  };

  return (
    <div style={styles.container}>
      <div style={styles.mainArea}>
        <div style={styles.boardArea}>
          {/* Opponent info and captured pieces */}
          <div style={styles.opponentSection}>
            <div style={styles.playerInfo}>
              <span style={styles.playerName}>{opponentName}</span>
              <span style={styles.colorIndicator}>
                {playerColor === 'white' ? '(Black)' : '(White)'}
              </span>
            </div>
            <CapturedPieces
              pieces={playerColor === 'white' ? capturedPieces.white : capturedPieces.black}
              playerColor={playerColor === 'white' ? 'black' : 'white'}
            />
          </div>

          {/* Chess board */}
          <ChessBoard fen={fen} onMove={handleMove} playerColor={playerColor} game={game} />

          {/* Player info and captured pieces */}
          <div style={styles.playerSection}>
            <CapturedPieces
              pieces={playerColor === 'white' ? capturedPieces.black : capturedPieces.white}
              playerColor={playerColor}
            />
            <div style={styles.playerInfo}>
              <span style={styles.playerName}>{playerName}</span>
              <span style={styles.colorIndicator}>
                ({playerColor === 'white' ? 'White' : 'Black'})
              </span>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div style={styles.sidebar}>
          <div style={styles.sidebarSection}>
            <h2 style={styles.sidebarTitle}>Game Info</h2>
            <div style={{ ...styles.turnIndicator, color: isMyTurn() ? '#4caf50' : '#999' }}>
              {isMyTurn() ? 'Your turn' : "Opponent's turn"}
            </div>
          </div>

          {/* Move history */}
          <div style={styles.sidebarSection}>
            <h3 style={styles.sectionTitle}>Move History</h3>
            <div style={styles.moveHistory}>
              {moveHistory.map((move, index) => (
                <div key={index} style={styles.moveItem}>
                  {Math.floor(index / 2) + 1}. {move}
                </div>
              ))}
            </div>
          </div>

          {/* Chat */}
          <div style={styles.sidebarSection}>
            <h3 style={styles.sectionTitle}>Chat</h3>
            <Chat messages={chatMessages} onSendMessage={handleSendMessage} playerName={playerName} />
          </div>

          {/* Game controls */}
          <div style={styles.sidebarSection}>
            <GameControls
              onResign={handleResign}
              onOfferDraw={handleOfferDraw}
              gameStatus={gameStatus}
              drawOffered={drawOffered}
            />
          </div>
        </div>
      </div>

      {/* Draw offer notification */}
      {drawOffered && (
        <div style={styles.drawOfferNotification}>
          <p style={styles.drawOfferText}>{offeringPlayer} has offered a draw.</p>
          <div style={styles.drawOfferButtons}>
            <button onClick={() => handleRespondToDraw(true)} style={styles.acceptButton}>
              Accept
            </button>
            <button onClick={() => handleRespondToDraw(false)} style={styles.declineButton}>
              Decline
            </button>
          </div>
        </div>
      )}

      {/* Game end modal */}
      {gameStatus !== 'playing' && (
        <GameEndModal
          gameStatus={gameStatus}
          winner={winner}
          playerName={playerName}
          onReturnToLobby={onReturnToLobby}
        />
      )}
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
    padding: '20px'
  },
  mainArea: {
    display: 'flex',
    justifyContent: 'center',
    gap: '20px',
    maxWidth: '1400px',
    margin: '0 auto'
  },
  boardArea: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  opponentSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  playerSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  playerInfo: {
    backgroundColor: 'white',
    padding: '10px',
    borderRadius: '4px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  playerName: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#333'
  },
  colorIndicator: {
    fontSize: '14px',
    color: '#666'
  },
  sidebar: {
    width: '300px',
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
  },
  sidebarSection: {
    backgroundColor: 'white',
    borderRadius: '4px',
    padding: '15px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  sidebarTitle: {
    margin: '0 0 10px 0',
    fontSize: '20px',
    color: '#333'
  },
  sectionTitle: {
    margin: '0 0 10px 0',
    fontSize: '16px',
    color: '#333'
  },
  turnIndicator: {
    fontSize: '18px',
    fontWeight: 'bold',
    textAlign: 'center'
  },
  moveHistory: {
    maxHeight: '150px',
    overflowY: 'auto',
    fontSize: '14px'
  },
  moveItem: {
    padding: '5px',
    borderBottom: '1px solid #f0f0f0'
  },
  drawOfferNotification: {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '8px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
    zIndex: 999,
    textAlign: 'center'
  },
  drawOfferText: {
    fontSize: '18px',
    marginBottom: '20px',
    color: '#333'
  },
  drawOfferButtons: {
    display: 'flex',
    gap: '15px',
    justifyContent: 'center'
  },
  acceptButton: {
    padding: '10px 30px',
    fontSize: '16px',
    backgroundColor: '#4caf50',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  declineButton: {
    padding: '10px 30px',
    fontSize: '16px',
    backgroundColor: '#d32f2f',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  }
};

export default Game;
