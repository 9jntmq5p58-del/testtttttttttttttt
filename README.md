# Chess App - Real-Time Multiplayer Chess Game

A real-time multiplayer chess application built with React and Node.js where friends can play chess together online.

## Features

- **Real-time gameplay** - WebSocket-based communication for instant move updates
- **Guest play** - No registration required, just enter a name and play
- **Lobby system** - Browse open games or create your own
- **In-game chat** - Chat with your opponent during the game
- **Move highlighting** - See legal moves when selecting a piece
- **Captured pieces display** - Track captured pieces for both players
- **Sound effects** - Audio feedback for moves, captures, check, and game end
- **Game controls** - Resign or offer draw at any time
- **All chess rules** - Checkmate, stalemate, castling, en passant, pawn promotion

## Tech Stack

**Frontend:**
- React 18
- Socket.io-client for WebSocket communication
- chess.js for game logic
- react-chessboard for chess board display

**Backend:**
- Node.js with Express
- Socket.io for WebSocket server
- chess.js for server-side move validation

## Project Structure

```
.
├── client/                    # React frontend
│   ├── public/
│   │   └── sounds/           # Sound effect files
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── App.jsx          # Main app component
│   │   ├── App.css          # Global styles
│   │   └── index.js         # React entry point
│   └── package.json
│
└── server/                    # Node.js backend
    ├── src/
    │   ├── server.js         # Main server & Socket.io
    │   ├── gameManager.js    # Game state management
    │   └── lobbyManager.js   # Lobby management
    └── package.json
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm

### Installation

1. Clone the repository
2. Install server dependencies:
   ```bash
   cd server
   npm install
   ```

3. Install client dependencies:
   ```bash
   cd client
   npm install
   ```

### Running the Application

**Start the server (Terminal 1):**
```bash
cd server
npm start
```
Server will start on http://localhost:3001

**Start the client (Terminal 2):**
```bash
cd client
npm start
```
Client will start on http://localhost:3000 and open in your browser

### Playing the Game

1. Enter your name on the welcome screen
2. In the lobby, either:
   - Click "Create Game" to create a new game and wait for an opponent
   - Click "Join" on an existing game to play against that player
3. Once both players join, the game begins with randomly assigned colors
4. Make moves by clicking and dragging pieces
5. Use the chat to communicate with your opponent
6. Resign or offer a draw using the game controls
7. When the game ends, click "Return to Lobby" to play again

## How It Works

### Game Flow

1. **Name Entry**: Players enter a display name (2-20 characters, letters/numbers/spaces only)
2. **Lobby**: Players can see all open games and create or join games
3. **Game Start**: When a second player joins, colors are randomly assigned and the game begins
4. **Gameplay**: Players take turns moving pieces with real-time updates via WebSocket
5. **Game End**: Game ends on checkmate, stalemate, draw acceptance, or resignation
6. **Return to Lobby**: Players can return to lobby and start a new game

### Real-Time Communication

The app uses Socket.io for WebSocket communication between clients and server:

**Client → Server Events:**
- `create-game` - Create a new game in the lobby
- `join-game` - Join an existing game
- `make-move` - Send a chess move
- `send-message` - Send a chat message
- `resign` - Resign from the game
- `offer-draw` - Offer a draw to opponent
- `respond-draw` - Accept or decline a draw offer

**Server → Client Events:**
- `lobby-update` - Updated list of open games
- `game-started` - Game begins with player assignments
- `move-made` - Move was made and validated
- `game-over` - Game ended (checkmate, stalemate, draw, resignation)
- `chat-message` - Chat message received
- `draw-offered` - Opponent offered a draw
- `opponent-disconnected` - Opponent left the game

### Game State Management

- **Server-side validation**: All moves are validated on the server using chess.js
- **In-memory storage**: Game state is stored in memory (resets on server restart)
- **Turn enforcement**: Server ensures players can only move on their turn
- **Automatic game end detection**: Server detects checkmate, stalemate, and draws

## Features in Detail

### Move Highlighting
- Click a piece to see all legal moves
- Green highlights for normal moves
- Red highlights for captures
- Click elsewhere to deselect

### Captured Pieces
- Displayed above opponent's side and below player's side
- Shows piece type and count
- Updates in real-time after captures

### Chat System
- Send messages up to 200 characters
- Messages appear left-aligned (opponent) or right-aligned (player)
- Shows sender name and timestamp
- Auto-scrolls to latest message

### Draw Offers
- Either player can offer a draw at any time
- Opponent receives a notification with Accept/Decline buttons
- Game ends in draw if accepted
- Can only send one draw offer at a time

### Sound Effects
- **Move sound**: Played on normal moves
- **Capture sound**: Played when a piece is captured
- **Check sound**: Played when king is in check
- **Game end sound**: Played when game ends

Note: Sound files are placeholders and can be replaced with actual audio files.

## Edge Cases Handled

- **Disconnection**: If a player disconnects, the opponent is notified and can return to lobby
- **Invalid moves**: Client-side validation prevents most invalid moves; server validates all moves
- **Turn enforcement**: Players cannot move opponent's pieces or move when it's not their turn
- **Lobby cleanup**: Games are removed from lobby when players disconnect or game starts
- **Pawn promotion**: Pawns automatically promote to queen (simplest option)
- **Special moves**: En passant and castling are fully supported by chess.js

## Limitations

- **No persistence**: Game state is not saved (in-memory only)
- **No reconnection**: If you disconnect, you cannot rejoin the same game
- **No spectators**: Only the two players can see the game
- **No time controls**: Games have unlimited time per move
- **No game history**: Previous games are not saved or accessible

## Future Enhancements

Possible features for future versions:
- Database persistence for game history
- User accounts and authentication
- ELO rating system
- Time controls (blitz, rapid, classical)
- Game analysis and replay
- Spectator mode
- Multiple game variants (Chess960, etc.)
- Mobile responsive design
- Better sound effects
- Themes and customization

## License

This project is open source and available for educational purposes.

## Contributing

Feel free to fork, modify, and submit pull requests!

## Support

For issues or questions, please open an issue in the repository.

---

Enjoy playing chess with your friends!
