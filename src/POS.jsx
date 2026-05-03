// src/POS.jsx INVENTARIO REAL

import React, { useEffect, useState } from "react";
import dataInicial from "./data";
import { db } from "./firebase";

import {
  collection,
  addDoc,
  doc,
  setDoc,
  getDocs
} from "firebase/firestore";

export default function POS({ user }) {
  const [busqueda, setBusqueda] = useState("");
  const [carrito, setCarrito] = useState([]);
  const [lista, setLista] = useState([]);

  useEffect(() => {
    cargarInventario();
  }, []);

  const cargarInventario = async () => {
    const snap = await getDocs(
      collection(db, "inventario")
    );

    if (!snap.empty) {
      const datos = [];

      snap.forEach((d) =>
        datos.push(d.data())
      );

      setLista(datos);
    } else {
      setLista(dataInicial);
    }
  };

  const nombre = (p) =>
    p.nombre || "Sin nombre";

  const precio = (p) =>
    Number(p.venta || 0);

  const stock = (p) =>
    Number(p.stock || 0);

  const productosFiltrados = lista.filter(
    (p) =>
      nombre(p)
        .toLowerCase()
        .includes(
          busqueda.toLowerCase()
        )
  );

  const agregar = (p) => {
    if (stock(p) <= 0) {
      alert("Sin stock");
      return;
    }

    setCarrito([...carrito, p]);
  };

  const total = carrito.reduce(
    (sum, i) => sum + precio(i),
    0
  );

  const cobrar = async () => {
    if (carrito.length === 0) return;

    const nuevaLista = [...lista];

    carrito.forEach((item) => {
      const i = nuevaLista.findIndex(
        (x) =>
          x.codigo === item.codigo
      );

      if (i !== -1) {
        nuevaLista[i].stock =
          stock(nuevaLista[i]) - 1;
      }
    });

    setLista(nuevaLista);

    // GUARDAR INVENTARIO CLOUD
    for (const item of nuevaLista) {
      await setDoc(
        doc(
          db,
          "inventario",
          item.codigo
        ),
        item
      );
    }

    // GUARDAR VENTA
    await addDoc(
      collection(db, "ventas"),
      {
        fecha:
          new Date().toLocaleString(),
        usuario: user,
        productos: carrito,
        total: total
      }
    );

    localStorage.setItem(
      "inventario",
      JSON.stringify(nuevaLista)
    );

    setCarrito([]);

    alert(
      "Venta guardada e inventario actualizado"
    );
  };

  return (
    <div className="pos-layout">
      <div className="productos-panel">
        <h2>🛒 POS INVENTARIO REAL</h2>

        <input
          placeholder="Buscar..."
          value={busqueda}
          onChange={(e) =>
            setBusqueda(
              e.target.value
            )
          }
        />

        <div className="productos-lista">
          {productosFiltrados
            .slice(0, 80)
            .map((p, i) => (
              <button
                key={i}
                onClick={() =>
                  agregar(p)
                }
              >
                {nombre(p)} - $
                {precio(p)} |
                Stock:
                {stock(p)}
              </button>
            ))}
        </div>
      </div>

      <div className="carrito-panel">
        <h2>📦 Carrito</h2>

        {carrito.map((x, i) => (
          <div
            key={i}
            className="item-carrito"
          >
            {nombre(x)} - $
            {precio(x)}
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
