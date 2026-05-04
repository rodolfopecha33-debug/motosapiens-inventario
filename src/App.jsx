// src/App.jsx ROLES SAFE

import React, { useEffect, useState } from "react";
import Login from "./Login";
import POS from "./POS";
import Dashboard from "./Dashboard";
import CargadorFirebase from "./CargadorFirebase";
import InventarioAdmin from "./InventarioAdmin";
import Compras from "./Compras";
import Kardex from "./Kardex";


export default function App() {
  const [user, setUser] = useState(null);
  const [vista, setVista] = useState("pos");

  useEffect(() => {
    const guardado = localStorage.getItem("user");

    if (guardado) {
      try {
        setUser(JSON.parse(guardado));
      } catch {
        localStorage.removeItem("user");
      }
    }
  }, []);

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
            style={btn()}
            onClick={() =>
              setVista("pos")
            }
          >
            🛒 POS
          </button>

          {esAdmin && (
            <button
              style={btn()}
              onClick={() =>
                setVista("dashboard")
              }
            >
              📊 Dashboard
            </button>
          )}

          {esAdmin && (
            <button
              style={btn()}
              onClick={() =>
                setVista("inventario")
              }
            >
              ☁️ Inventario
            </button>
          )}

           {esAdmin && (
           <button onClick={() => setVista("compras")}>🛒 Compras</button>
          )}

           {esAdmin && (
           <button onClick={() => setVista("kardex")}>📊 Kardex</button>
          )}

          <button
            onClick={salir}
            style={{
              background:"#ff2a2a",
              color:"white",
              border:"none",
              padding:"10px 16px",
              borderRadius:"8px",
              cursor:"pointer"
            }}
          >
            Salir
          </button>
        </div>
      </div>

      {/* CONTENIDO */}
      {vista === "pos" && (
        <POS user={user.nombre} />
      )}

      {vista === "dashboard" &&
        esAdmin && (
          <Dashboard />
      )}

     {vista === "inventario" && esAdmin && (
  <InventarioAdmin />
)}
      {vista === "compras" && esAdmin && <Compras />}
{vista === "kardex" && esAdmin && <Kardex />}
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
