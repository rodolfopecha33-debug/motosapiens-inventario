// src/App.jsx MENU FINAL

import React, { useEffect, useState } from "react";

import Login from "./Login";
import POS from "./POS";
import Dashboard from "./Dashboard";

export default function App() {
  const [user, setUser] = useState(
    localStorage.getItem("user") || ""
  );

  const [vista, setVista] = useState("pos");

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
      {/* TOPBAR */}
      <div
        style={{
          background: "#111",
          padding: "14px 20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "10px"
        }}
      >
        <div
          style={{
            color: "white",
            fontWeight: "bold"
          }}
        >
          👤 {user}
        </div>

        <div
          style={{
            display: "flex",
            gap: "10px",
            flexWrap: "wrap"
          }}
        >
          <button
            onClick={() => setVista("pos")}
            style={boton(vista === "pos")}
          >
            🛒 POS
          </button>

          <button
            onClick={() => setVista("dashboard")}
            style={boton(vista === "dashboard")}
          >
            📊 Dashboard
          </button>

          <button
            onClick={cerrarSesion}
            style={{
              background: "#ff2a2a",
              color: "white",
              border: "none",
              padding: "10px 16px",
              borderRadius: "8px",
              cursor: "pointer"
            }}
          >
            Salir
          </button>
        </div>
      </div>

      {/* CONTENIDO */}
      {vista === "pos" && <POS user={user} />}
      {vista === "dashboard" && <Dashboard />}
    </div>
  );
}

function boton(activo) {
  return {
    background: activo ? "#16b84e" : "#222",
    color: "white",
    border: "none",
    padding: "10px 16px",
    borderRadius: "8px",
    cursor: "pointer"
  };
}
