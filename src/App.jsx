// src/App.jsx PRO MENU

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
        salir();
      }, 15 * 60 * 1000);
    }

    return () => clearTimeout(timer);
  }, [user]);

  const entrar = (nombre) => {
    localStorage.setItem("user", nombre);
    setUser(nombre);
  };

  const salir = () => {
    localStorage.removeItem("user");
    setUser("");
  };

  if (!user) {
    return <Login onLogin={entrar} />;
  }

  return (
    <div>
      <div className="topbar">
        <div>
          👤 {user}
        </div>

        <div style={{ display:"flex", gap:"10px" }}>
          <button
            onClick={() => setVista("pos")}
          >
            POS
          </button>

          <button
            onClick={() => setVista("dashboard")}
          >
            Dashboard
          </button>

          <button onClick={salir}>
            Salir
          </button>
        </div>
      </div>

      {vista === "pos" && (
        <POS user={user} />
      )}

      {vista === "dashboard" && (
        <Dashboard />
      )}
    </div>
  );
}
