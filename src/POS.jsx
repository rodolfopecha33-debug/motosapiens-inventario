// src/POS.jsx

import React, { useState } from "react";

export default function POS({ user }) {
  const productos = [
    { nombre: "ACEITE MOBIL", precio: 35000 },
    { nombre: "FILTRO FZ", precio: 28000 },
    { nombre: "PASTILLAS PULSAR 180", precio: 45000 },
    { nombre: "BALINERA 6300 KOYO", precio: 14500 }
  ];

  const [busqueda, setBusqueda] = useState("");
  const [carrito, setCarrito] = useState([]);

  const filtrados = productos.filter((p) =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  const agregar = (producto) => {
    setCarrito([...carrito, producto]);
  };

  const total = carrito.reduce((sum, item) => sum + item.precio, 0);

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
          placeholder="Buscar producto..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />

        <div className="productos-lista">
          {filtrados.map((p, i) => (
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
