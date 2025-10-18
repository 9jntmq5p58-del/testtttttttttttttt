class LobbyManager {
  constructor() {
    this.games = new Map();
  }

  /**
   * Create a new game in the lobby
   * @param {string} socketId - Creator's socket ID
   * @param {string} playerName - Creator's display name
   * @returns {string} gameId - Generated game ID
   */
  createGame(socketId, playerName) {
    // Generate unique game ID using timestamp and random string
    const gameId = 'game_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

    const game = {
      gameId,
      creatorSocketId: socketId,
      creatorName: playerName,
      status: 'waiting'
    };

    this.games.set(gameId, game);
    return gameId;
  }

  /**
   * Join an existing game
   * @param {string} gameId - Game ID to join
   * @param {string} socketId - Joiner's socket ID
   * @param {string} playerName - Joiner's display name
   * @returns {object|null} Game object with creator and joiner info, or null if error
   */
  joinGame(gameId, socketId, playerName) {
    const game = this.games.get(gameId);

    if (!game || game.status !== 'waiting') {
      return null;
    }

    // Update game status to playing
    game.status = 'playing';

    return {
      gameId: game.gameId,
      creator: {
        socketId: game.creatorSocketId,
        name: game.creatorName
      },
      joiner: {
        socketId,
        name: playerName
      }
    };
  }

  /**
   * Get list of all open games waiting for players
   * @returns {Array} Array of open game objects
   */
  getOpenGames() {
    const openGames = [];

    for (const game of this.games.values()) {
      if (game.status === 'waiting') {
        openGames.push({
          gameId: game.gameId,
          creatorName: game.creatorName
        });
      }
    }

    return openGames;
  }

  /**
   * Remove a game from the lobby
   * @param {string} gameId - Game ID to remove
   */
  removeGame(gameId) {
    this.games.delete(gameId);
  }

  /**
   * Get game by creator's socket ID
   * @param {string} socketId - Creator's socket ID
   * @returns {object|null} Game object if found, null otherwise
   */
  getGameByCreatorSocketId(socketId) {
    for (const game of this.games.values()) {
      if (game.creatorSocketId === socketId) {
        return game;
      }
    }
    return null;
  }
}

module.exports = LobbyManager;
