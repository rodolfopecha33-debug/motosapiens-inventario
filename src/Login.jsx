// src/Login.jsx

import React, { useState } from "react";

export default function Login({ onLogin }) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  const users = {
    "1234": "Rodolfo",
    "2222": "Gabriela",
    "3333": "Gilberto"
  };

  const handleLogin = () => {
    if (users[pin]) {
      onLogin(users[pin]);
      setError("");
    } else {
      setError("PIN incorrecto");
    }
  };

  return (
    <div className="login-screen">
      <div className="login-box">
        <h1>🏍️ MOTOSAPIENS</h1>
        <p>Ingrese PIN</p>

        <input
          type="password"
          maxLength="4"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          placeholder="****"
        />

        <button onClick={handleLogin}>Entrar</button>

        {error && <small>{error}</small>}
      </div>
    </div>
  );
}
