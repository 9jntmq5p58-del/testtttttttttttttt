import React, { useState } from 'react';

const PlayerNameInput = ({ onNameSubmit }) => {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const validateName = (inputName) => {
    const trimmedName = inputName.trim();

    if (trimmedName.length < 2) {
      return 'Name must be at least 2 characters';
    }

    if (trimmedName.length > 20) {
      return 'Name must be at most 20 characters';
    }

    // Allow letters, numbers, and spaces only
    const regex = /^[a-zA-Z0-9 ]+$/;
    if (!regex.test(trimmedName)) {
      return 'Name can only contain letters, numbers, and spaces';
    }

    return null;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const validationError = validateName(name);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError('');
    onNameSubmit(name.trim());
  };

  const handleChange = (e) => {
    setName(e.target.value);
    if (error) {
      setError('');
    }
  };

  const isValid = !validateName(name);

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.heading}>Enter Your Name</h1>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={name}
            onChange={handleChange}
            placeholder="Your name"
            style={styles.input}
            autoFocus
          />
          {error && <div style={styles.error}>{error}</div>}
          <button
            type="submit"
            disabled={!isValid}
            style={{
              ...styles.button,
              ...(isValid ? {} : styles.buttonDisabled)
            }}
          >
            Join Lobby
          </button>
        </form>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#f5f5f5'
  },
  card: {
    backgroundColor: 'white',
    padding: '40px',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    maxWidth: '400px',
    width: '100%'
  },
  heading: {
    textAlign: 'center',
    marginBottom: '30px',
    color: '#333'
  },
  input: {
    width: '100%',
    padding: '12px',
    fontSize: '16px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    marginBottom: '10px',
    boxSizing: 'border-box'
  },
  error: {
    color: '#d32f2f',
    fontSize: '14px',
    marginBottom: '10px',
    marginTop: '-5px'
  },
  button: {
    width: '100%',
    padding: '12px',
    fontSize: '16px',
    backgroundColor: '#1976d2',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'background-color 0.3s'
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
    cursor: 'not-allowed'
  }
};

export default PlayerNameInput;
