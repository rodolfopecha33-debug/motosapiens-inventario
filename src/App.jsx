import React, { useState } from "react";
import "./styles.css";

export default function App() {
  const [open, setOpen] = useState(false);

  const cards = [
    { icon: "💰", title: "Ventas Hoy", value: "$0" },
    { icon: "📦", title: "Productos", value: "2331" },
    { icon: "📈", title: "Ganancia", value: "$0" },
    { icon: "🔧", title: "Órdenes", value: "0" },
  ];

  const quick = [
    "Nueva Venta",
    "Inventario",
    "Clientes",
    "Caja",
    "Taller",
    "WhatsApp",
  ];

  return (
    <div className="layout">
      <aside className={`sidebar ${open ? "show" : ""}`}>
        <div className="logo">
          🏍️ <span>MOTOSAPIENS</span>
          <small>Evoluciona tu moto</small>
        </div>

        <nav>
          <a>🏠 Dashboard</a>
          <a>💰 Ventas</a>
          <a>📦 Inventario</a>
          <a>🔧 Taller</a>
          <a>👥 Clientes</a>
          <a>📊 Reportes</a>
          <a>⚙️ Configuración</a>
        </nav>
      </aside>

      <main className="main">
        <button className="menu" onClick={() => setOpen(!open)}>☰</button>

        <header>
          <h1>Resumen del Día</h1>
          <p>Bienvenido a Motosapiens</p>
        </header>

        <section className="cards">
          {cards.map((item) => (
            <div className="card" key={item.title}>
              <div className="top">
                <span>{item.icon}</span>
                <small>{item.title}</small>
              </div>
              <h2>{item.value}</h2>
            </div>
          ))}
        </section>

        <section className="quick">
          <h3>Accesos Rápidos</h3>
          <div className="grid">
            {quick.map((q) => (
              <button key={q}>{q}</button>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
