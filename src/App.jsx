// src/App.jsx

import React, { useEffect, useState } from "react";
import Login from "./Login";
import POS from "./POS";

export default function App() {
  const [user, setUser] = useState(localStorage.getItem("user") || "");

  useEffect(() => {
    let timer;

    if (user) {
      timer = setTimeout(() => {
        alert("Sesión cerrada por inactividad");
        cerrarSesion();
      }, 15 * 60 * 1000);
    }

    return () => clearTimeout(timer);
  }, [user]);

  const entrar = (nombre) => {
    localStorage.setItem("user", nombre);
    setUser(nombre);
  };

  const cerrarSesion = () => {
    localStorage.removeItem("user");
    setUser("");
  };

  if (!user) {
    return <Login onLogin={entrar} />;
  }

  return (
    <div>
      <div className="topbar">
        <span>👤 {user}</span>
        <button onClick={cerrarSesion}>Salir</button>
      </div>

      <POS user={user} />
    </div>
  );
}
