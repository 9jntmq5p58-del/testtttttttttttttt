const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const LobbyManager = require('./lobbyManager');
const GameManager = require('./gameManager');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

const lobbyManager = new LobbyManager();
const gameManager = new GameManager();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Handle get lobby list
  socket.on('get-lobby-list', () => {
    socket.join('lobby');
    const games = lobbyManager.getOpenGames();
    socket.emit('lobby-update', { games });
  });

  // Handle create game
  socket.on('create-game', (data) => {
    const gameId = lobbyManager.createGame(socket.id, data.playerName);
    socket.join('lobby');
    console.log(`Game created: ${gameId} by ${data.playerName}`);

    // Broadcast updated lobby to all clients in lobby
    const games = lobbyManager.getOpenGames();
    io.to('lobby').emit('lobby-update', { games });
  });

  // Handle join game
  socket.on('join-game', (data) => {
    const result = lobbyManager.joinGame(data.gameId, socket.id, data.playerName);

    if (!result) {
      socket.emit('join-error', { error: 'Game no longer available' });
      return;
    }

    const { gameId, creator, joiner } = result;

    // Both players join the game room
    socket.join(gameId);
    const creatorSocket = io.sockets.sockets.get(creator.socketId);
    if (creatorSocket) {
      creatorSocket.join(gameId);
      creatorSocket.leave('lobby');
    }
    socket.leave('lobby');

    // Create game state
    const gameData = gameManager.createGame(gameId, creator, joiner);

    console.log(`Game started: ${gameId} - ${gameData.white.name} (white) vs ${gameData.black.name} (black)`);

    // Emit game-started to both players
    io.to(gameId).emit('game-started', {
      gameId: gameData.gameId,
      white: gameData.white,
      black: gameData.black,
      fen: gameData.fen
    });

    // Remove game from lobby and broadcast update
    lobbyManager.removeGame(gameId);
    const games = lobbyManager.getOpenGames();
    io.to('lobby').emit('lobby-update', { games });
  });

  // Handle make move
  socket.on('make-move', (data) => {
    const result = gameManager.makeMove(data.gameId, socket.id, data.move);

    if (!result.valid) {
      socket.emit('move-error', { error: result.error });
      return;
    }

    // Emit move to both players
    io.to(data.gameId).emit('move-made', {
      fen: result.fen,
      moveHistory: result.moveHistory,
      isCapture: result.isCapture,
      isCheck: result.isCheck
    });

    // If game is over, emit game-over event
    if (result.gameOver) {
      io.to(data.gameId).emit('game-over', {
        status: result.status,
        winner: result.winner
      });
    }
  });

  // Handle send message
  socket.on('send-message', (data) => {
    const game = gameManager.getGame(data.gameId);

    if (!game) {
      return;
    }

    // Determine sender name
    const senderName = socket.id === game.white.socketId
      ? game.white.name
      : game.black.name;

    const messageObj = gameManager.addChatMessage(data.gameId, senderName, data.message);

    if (messageObj) {
      io.to(data.gameId).emit('chat-message', messageObj);
    }
  });

  // Handle resign
  socket.on('resign', (data) => {
    const winner = gameManager.resignGame(data.gameId, socket.id);

    if (winner) {
      io.to(data.gameId).emit('game-over', {
        status: 'resigned',
        winner
      });
    }
  });

  // Handle offer draw
  socket.on('offer-draw', (data) => {
    const success = gameManager.offerDraw(data.gameId, socket.id);

    if (success) {
      const game = gameManager.getGame(data.gameId);
      const offeringPlayer = socket.id === game.white.socketId
        ? game.white.name
        : game.black.name;

      const opponentSocketId = gameManager.getOpponentSocketId(data.gameId, socket.id);

      if (opponentSocketId) {
        io.to(opponentSocketId).emit('draw-offered', { offeringPlayer });
      }
    }
  });

  // Handle respond to draw
  socket.on('respond-draw', (data) => {
    const result = gameManager.respondToDraw(data.gameId, socket.id, data.accept);

    if (result.success) {
      if (result.accepted) {
        // Draw accepted, end game
        io.to(data.gameId).emit('game-over', {
          status: 'draw',
          winner: null
        });
      } else {
        // Draw declined, notify offerer
        const game = gameManager.getGame(data.gameId);
        if (game && game.drawOfferedBy) {
          io.to(game.drawOfferedBy).emit('draw-declined');
        }
      }
    }
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);

    // Check if socket is in any active game
    const game = gameManager.getGameBySocketId(socket.id);
    if (game) {
      const opponentSocketId = gameManager.getOpponentSocketId(game.gameId, socket.id);
      if (opponentSocketId) {
        io.to(opponentSocketId).emit('opponent-disconnected');
      }
      gameManager.removeGame(game.gameId);
    }

    // Check if socket is waiting in lobby
    const lobbyGame = lobbyManager.getGameByCreatorSocketId(socket.id);
    if (lobbyGame) {
      lobbyManager.removeGame(lobbyGame.gameId);
      const games = lobbyManager.getOpenGames();
      io.to('lobby').emit('lobby-update', { games });
    }
  });
});

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
