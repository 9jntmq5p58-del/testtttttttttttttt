import React, { useState, useEffect, useRef } from 'react';

const Chat = ({ messages, onSendMessage, playerName }) => {
  const [currentMessage, setCurrentMessage] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();

    const trimmedMessage = currentMessage.trim();

    if (trimmedMessage.length === 0 || trimmedMessage.length > 200) {
      return;
    }

    onSendMessage(trimmedMessage);
    setCurrentMessage('');
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  return (
    <div style={styles.container}>
      <div style={styles.messagesContainer}>
        {messages.map((msg, index) => {
          const isOwnMessage = msg.sender === playerName;
          return (
            <div
              key={index}
              style={{
                ...styles.messageWrapper,
                alignItems: isOwnMessage ? 'flex-end' : 'flex-start'
              }}
            >
              <div
                style={{
                  ...styles.message,
                  ...(isOwnMessage ? styles.ownMessage : styles.opponentMessage)
                }}
              >
                <div style={styles.senderName}>{msg.sender}</div>
                <div style={styles.messageText}>{msg.message}</div>
                <div style={styles.timestamp}>{formatTime(msg.timestamp)}</div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} style={styles.inputContainer}>
        <input
          type="text"
          value={currentMessage}
          onChange={(e) => setCurrentMessage(e.target.value)}
          placeholder="Type a message..."
          style={styles.input}
          maxLength={200}
        />
        <button
          type="submit"
          disabled={currentMessage.trim().length === 0}
          style={{
            ...styles.sendButton,
            ...(currentMessage.trim().length === 0 ? styles.sendButtonDisabled : {})
          }}
        >
          Send
        </button>
      </form>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '250px',
    borderTop: '1px solid #ddd'
  },
  messagesContainer: {
    flex: 1,
    overflowY: 'auto',
    padding: '10px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  messageWrapper: {
    display: 'flex',
    flexDirection: 'column'
  },
  message: {
    maxWidth: '80%',
    padding: '8px 12px',
    borderRadius: '8px',
    wordWrap: 'break-word'
  },
  ownMessage: {
    backgroundColor: '#1976d2',
    color: 'white',
    alignSelf: 'flex-end'
  },
  opponentMessage: {
    backgroundColor: '#e0e0e0',
    color: '#333',
    alignSelf: 'flex-start'
  },
  senderName: {
    fontSize: '12px',
    fontWeight: 'bold',
    marginBottom: '4px',
    opacity: 0.8
  },
  messageText: {
    fontSize: '14px',
    marginBottom: '4px'
  },
  timestamp: {
    fontSize: '11px',
    opacity: 0.7,
    textAlign: 'right'
  },
  inputContainer: {
    display: 'flex',
    padding: '10px',
    borderTop: '1px solid #ddd',
    gap: '10px'
  },
  input: {
    flex: 1,
    padding: '8px',
    fontSize: '14px',
    border: '1px solid #ddd',
    borderRadius: '4px'
  },
  sendButton: {
    padding: '8px 20px',
    fontSize: '14px',
    backgroundColor: '#1976d2',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
    cursor: 'not-allowed'
  }
};

export default Chat;
