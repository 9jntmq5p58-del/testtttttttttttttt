const { Chess } = require('chess.js');

class GameManager {
  constructor() {
    this.games = new Map();
    this.socketToGame = new Map();
  }

  /**
   * Create a new game with two players
   * @param {string} gameId - Game ID
   * @param {object} player1 - First player {socketId, name}
   * @param {object} player2 - Second player {socketId, name}
   * @returns {object} Game initialization data
   */
  createGame(gameId, player1, player2) {
    // Randomly assign white and black
    const isPlayer1White = Math.random() < 0.5;
    const white = isPlayer1White ? player1 : player2;
    const black = isPlayer1White ? player2 : player1;

    // Initialize chess.js instance
    const chess = new Chess();

    const game = {
      gameId,
      white,
      black,
      chess,
      moveHistory: [],
      chatMessages: [],
      drawOffered: false,
      drawOfferedBy: null
    };

    this.games.set(gameId, game);
    this.socketToGame.set(player1.socketId, gameId);
    this.socketToGame.set(player2.socketId, gameId);

    return {
      gameId,
      white,
      black,
      fen: chess.fen()
    };
  }

  /**
   * Make a move in a game
   * @param {string} gameId - Game ID
   * @param {string} socketId - Player's socket ID
   * @param {object} move - Move object {from, to, promotion}
   * @returns {object} Result object
   */
  makeMove(gameId, socketId, move) {
    const game = this.games.get(gameId);

    if (!game) {
      return { valid: false, error: 'Game not found' };
    }

    // Verify it's the player's turn
    const currentTurn = game.chess.turn(); // 'w' or 'b'
    const isWhiteTurn = currentTurn === 'w';
    const isPlayersTurn = isWhiteTurn
      ? socketId === game.white.socketId
      : socketId === game.black.socketId;

    if (!isPlayersTurn) {
      return { valid: false, error: 'Not your turn' };
    }

    // Attempt to make the move
    try {
      const result = game.chess.move(move);

      if (!result) {
        return { valid: false, error: 'Invalid move' };
      }

      // Move is valid, update move history
      game.moveHistory = game.chess.history();

      // Check if move was a capture
      const isCapture = result.captured !== undefined;

      // Check if king is in check
      const isCheck = game.chess.inCheck();

      // Check game over conditions
      let gameOver = false;
      let status = null;
      let winner = null;

      if (game.chess.isCheckmate()) {
        gameOver = true;
        status = 'checkmate';
        // Current player (who just moved) is the winner
        winner = isWhiteTurn ? game.white.name : game.black.name;
      } else if (game.chess.isStalemate()) {
        gameOver = true;
        status = 'stalemate';
        winner = null;
      } else if (game.chess.isThreefoldRepetition() || game.chess.isDraw()) {
        gameOver = true;
        status = 'draw';
        winner = null;
      }

      return {
        valid: true,
        fen: game.chess.fen(),
        moveHistory: game.moveHistory,
        isCapture,
        isCheck,
        gameOver,
        status,
        winner
      };
    } catch (error) {
      return { valid: false, error: 'Invalid move' };
    }
  }

  /**
   * Get chat messages for a game
   * @param {string} gameId - Game ID
   * @returns {Array} Array of chat messages
   */
  getChatMessages(gameId) {
    const game = this.games.get(gameId);
    return game ? game.chatMessages : [];
  }

  /**
   * Add a chat message to a game
   * @param {string} gameId - Game ID
   * @param {string} sender - Sender's name
   * @param {string} message - Message text
   * @returns {object} Message object
   */
  addChatMessage(gameId, sender, message) {
    const game = this.games.get(gameId);

    if (!game) {
      return null;
    }

    const messageObj = {
      sender,
      message,
      timestamp: new Date().toISOString()
    };

    game.chatMessages.push(messageObj);
    return messageObj;
  }

  /**
   * Offer a draw in a game
   * @param {string} gameId - Game ID
   * @param {string} socketId - Offerer's socket ID
   * @returns {boolean} Success
   */
  offerDraw(gameId, socketId) {
    const game = this.games.get(gameId);

    if (!game) {
      return false;
    }

    game.drawOffered = true;
    game.drawOfferedBy = socketId;
    return true;
  }

  /**
   * Respond to a draw offer
   * @param {string} gameId - Game ID
   * @param {string} socketId - Responder's socket ID
   * @param {boolean} accept - Accept or decline
   * @returns {object} Result object
   */
  respondToDraw(gameId, socketId, accept) {
    const game = this.games.get(gameId);

    if (!game || !game.drawOffered) {
      return { success: false, error: 'No draw offer pending' };
    }

    // Verify responder is not the offerer
    if (socketId === game.drawOfferedBy) {
      return { success: false, error: 'Cannot respond to your own draw offer' };
    }

    if (accept) {
      // Game ends in draw
      return { success: true, accepted: true, status: 'draw' };
    } else {
      // Reset draw offer
      game.drawOffered = false;
      game.drawOfferedBy = null;
      return { success: true, accepted: false };
    }
  }

  /**
   * Resign a game
   * @param {string} gameId - Game ID
   * @param {string} socketId - Resigner's socket ID
   * @returns {string} Winner's name
   */
  resignGame(gameId, socketId) {
    const game = this.games.get(gameId);

    if (!game) {
      return null;
    }

    // Determine winner (opponent of resigner)
    const winner = socketId === game.white.socketId
      ? game.black.name
      : game.white.name;

    return winner;
  }

  /**
   * Get a game by ID
   * @param {string} gameId - Game ID
   * @returns {object|null} Game object
   */
  getGame(gameId) {
    return this.games.get(gameId) || null;
  }

  /**
   * Remove a game
   * @param {string} gameId - Game ID
   */
  removeGame(gameId) {
    const game = this.games.get(gameId);

    if (game) {
      // Remove socket mappings
      this.socketToGame.delete(game.white.socketId);
      this.socketToGame.delete(game.black.socketId);
      // Remove game
      this.games.delete(gameId);
    }
  }

  /**
   * Get game by socket ID
   * @param {string} socketId - Socket ID
   * @returns {object|null} Game object
   */
  getGameBySocketId(socketId) {
    const gameId = this.socketToGame.get(socketId);
    return gameId ? this.games.get(gameId) : null;
  }

  /**
   * Get opponent's socket ID
   * @param {string} gameId - Game ID
   * @param {string} socketId - Player's socket ID
   * @returns {string|null} Opponent's socket ID
   */
  getOpponentSocketId(gameId, socketId) {
    const game = this.games.get(gameId);

    if (!game) {
      return null;
    }

    return socketId === game.white.socketId
      ? game.black.socketId
      : game.white.socketId;
  }
}

module.exports = GameManager;
