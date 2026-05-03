// src/App.jsx ROLES FINAL

import React, { useEffect, useState } from "react";

import Login from "./Login";
import POS from "./POS";
import Dashboard from "./Dashboard";
import CargadorFirebase from "./CargadorFirebase";

export default function App() {
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user")) || null
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

  const entrar = (usuario) => {
    localStorage.setItem(
      "user",
      JSON.stringify(usuario)
    );

    setUser(usuario);
  };

  const salir = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  if (!user) {
    return <Login onLogin={entrar} />;
  }

  const esAdmin =
    user.rol === "admin";

  return (
    <div>
      {/* TOPBAR */}
      <div
        style={{
          background:"#111",
          padding:"14px 20px",
          display:"flex",
          justifyContent:"space-between",
          alignItems:"center",
          flexWrap:"wrap",
          gap:"10px"
        }}
      >
        <div
          style={{
            color:"white",
            fontWeight:"bold"
          }}
        >
          👤 {user.nombre} ({user.rol})
        </div>

        <div
          style={{
            display:"flex",
            gap:"10px",
            flexWrap:"wrap"
          }}
        >
          <button
            onClick={() =>
              setVista("pos")
            }
            style={btn()}
          >
            🛒 POS
          </button>

          {esAdmin && (
            <button
              onClick={() =>
                setVista(
                  "dashboard"
                )
              }
              style={btn()}
            >
              📊 Dashboard
            </button>
          )}

          {esAdmin && (
            <button
              onClick={() =>
                setVista(
                  "inventario"
                )
              }
              style={btn()}
            >
              ☁️ Inventario
            </button>
          )}

          <button
            onClick={salir}
            style={{
              background:
                "#ff2a2a",
              color:"white",
              border:"none",
              padding:
                "10px 16px",
              borderRadius:
                "8px",
              cursor:"pointer"
            }}
          >
            Salir
          </button>
        </div>
      </div>

      {/* VISTAS */}
      {vista === "pos" && (
        <POS user={user.nombre} />
      )}

      {vista ===
        "dashboard" &&
        esAdmin && (
          <Dashboard />
      )}

      {vista ===
        "inventario" &&
        esAdmin && (
          <CargadorFirebase />
      )}
    </div>
  );
}

function btn() {
  return {
    background:"#16b84e",
    color:"white",
    border:"none",
    padding:"10px 16px",
    borderRadius:"8px",
    cursor:"pointer"
  };
}
