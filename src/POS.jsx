// src/POS.jsx REAL

import React, { useState } from "react";
import productos from "./data";

export default function POS({ user }) {
  const [busqueda, setBusqueda] = useState("");
  const [carrito, setCarrito] = useState([]);

  const lista = productos.filter((p) => {
    const texto = (p.nombre || "").toLowerCase();
    return texto.includes(busqueda.toLowerCase());
  });

  const agregar = (producto) => {
    setCarrito([...carrito, producto]);
  };

  const total = carrito.reduce(
    (sum, item) => sum + Number(item.precio || 0),
    0
  );

  const cobrar = () => {
    alert("Venta registrada por " + user);
    setCarrito([]);
  };

  return (
    <div className="pos-layout">
      <div className="productos-panel">
        <h2>🛒 Caja de Ventas</h2>

        <input
          type="text"
          placeholder="Buscar entre 2331 productos..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />

        <div className="productos-lista">
          {lista.slice(0, 80).map((p, i) => (
            <button key={i} onClick={() => agregar(p)}>
              {p.nombre} - ${p.precio}
            </button>
          ))}
        </div>
      </div>

      <div className="carrito-panel">
        <h2>📦 Carrito</h2>

        {carrito.map((item, i) => (
          <div key={i} className="item-carrito">
            {item.nombre} - ${item.precio}
          </div>
        ))}

        <h3>Total: ${total}</h3>

        <button className="btn-cobrar" onClick={cobrar}>
          Cobrar
        </button>
      </div>
    </div>
  );
}
