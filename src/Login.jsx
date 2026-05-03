// src/Login.jsx ADMIN PRO

import React, { useState } from "react";

export default function Login({ onLogin }) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  const usuarios = {
    "1234": {
      nombre: "Rodolfo",
      rol: "admin"
    },
    "2222": {
      nombre: "Gabriela",
      rol: "cajero"
    },
    "3333": {
      nombre: "Gilberto",
      rol: "cajero"
    }
  };

  const entrar = () => {
    if (usuarios[pin]) {
      onLogin(usuarios[pin]);
      setError("");
      return;
    }

    setError("PIN incorrecto");
  };

  return (
    <div className="login-screen">
      <div className="login-box">
        <h1>🏍️ MOTOSAPIENS</h1>

        <p>
          Ingrese PIN de acceso
        </p>

        <input
          type="password"
          maxLength="4"
          value={pin}
          onChange={(e) =>
            setPin(
              e.target.value
            )
          }
          placeholder="****"
        />

        <button
          onClick={entrar}
        >
          Entrar
        </button>

        {error && (
          <small>{error}</small>
        )}
      </div>
    </div>
  );
}
