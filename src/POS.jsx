// src/POS.jsx BUSINESS CLOUD

import React, { useState } from "react";

import productos from "./data";
import { db } from "./firebase";

import {
  collection,
  addDoc
} from "firebase/firestore";

export default function POS({ user }) {
  const [busqueda, setBusqueda] = useState("");
  const [carrito, setCarrito] = useState([]);
  const [lista, setLista] = useState(productos);

  const nombre = (p) =>
    p.nombre || p.producto || p.descripcion || "Sin nombre";

  const precio = (p) =>
    Number(
      p.venta ||
      p.precio ||
      p.valor ||
      0
    );

  const stock = (p) =>
    Number(
      p.stock ||
      p.cantidad ||
      p.existencia ||
      0
    );

  const productosFiltrados = lista.filter((p) =>
    nombre(p).toLowerCase().includes(busqueda.toLowerCase())
  );

  const agregar = (producto) => {
    if (stock(producto) <= 0) {
      alert("Sin stock");
      return;
    }

    setCarrito([...carrito, producto]);
  };

  const total = carrito.reduce(
    (sum, item) => sum + precio(item),
    0
  );

  const cobrar = async () => {
    if (carrito.length === 0) return;

    const venta = {
      fecha: new Date().toLocaleString(),
      usuario: user,
      productos: carrito,
      total: total
    };

    // FIREBASE
    await addDoc(collection(db, "ventas"), venta);

    // LOCAL STORAGE
    const historial =
      JSON.parse(localStorage.getItem("ventas")) || [];

    historial.push(venta);

    localStorage.setItem(
      "ventas",
      JSON.stringify(historial)
    );

    // DESCONTAR STOCK VISUAL
    const nuevaLista = [...lista];

    carrito.forEach((item) => {
      const i = nuevaLista.findIndex(
        (x) => nombre(x) === nombre(item)
      );

      if (i !== -1) {
        nuevaLista[i].stock =
          stock(nuevaLista[i]) - 1;
      }
    });

    setLista(nuevaLista);
    setCarrito([]);

    alert("Venta guardada correctamente");
  };

  return (
    <div className="pos-layout">
      <div className="productos-panel">
        <h2>🛒 Caja de Ventas</h2>

        <input
          placeholder="Buscar producto..."
          value={busqueda}
          onChange={(e) =>
            setBusqueda(e.target.value)
          }
        />

        <div className="productos-lista">
          {productosFiltrados.slice(0,80).map((p,i)=>(
            <button
              key={i}
              onClick={()=>agregar(p)}
            >
              {nombre(p)} - ${precio(p)} | Stock: {stock(p)}
            </button>
          ))}
        </div>
      </div>

      <div className="carrito-panel">
        <h2>📦 Carrito</h2>

        {carrito.map((x,i)=>(
          <div
            key={i}
            className="item-carrito"
          >
            {nombre(x)} - ${precio(x)}
          </div>
        ))}

        <h3>Total: ${total}</h3>

        <button
          className="btn-cobrar"
          onClick={cobrar}
        >
          Cobrar
        </button>
      </div>
    </div>
  );
}
