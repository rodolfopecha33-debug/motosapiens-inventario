import React, { useEffect, useState } from "react";
import { db } from "./firebase";

import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  addDoc
} from "firebase/firestore";

export default function InventarioAdmin() {
  const [lista, setLista] = useState([]);
  const [busqueda, setBusqueda] = useState("");

  const [nuevo, setNuevo] = useState({
    nombre: "",
    compra: "", 
    venta: "",
    stock: ""
  });

  useEffect(() => {
    cargar();
  }, []);

  const cargar = async () => {
    const snap = await getDocs(collection(db, "inventario"));
    const datos = [];

    snap.forEach((d) => {
      datos.push({
        id: d.id,
        ...d.data()
      });
    });

    setLista(datos);
  };

  // 🔥 Guardado automático
  const actualizarCampo = async (id, campo, valor) => {
    if (campo === "venta" || campo === "stock") {
      if (valor < 0) return;
    }

    const nuevaLista = lista.map((item) =>
      item.id === id ? { ...item, [campo]: valor } : item
    );

    setLista(nuevaLista);

    await updateDoc(doc(db, "inventario", id), {
      [campo]:
        campo === "venta" || campo === "stock"
          ? Number(valor)
          : valor
    });
  };

  const eliminar = async (id) => {
    if (!confirm("Eliminar producto?")) return;
    await deleteDoc(doc(db, "inventario", id));
    cargar();
  };

  const agregar = async () => {
    if (!nuevo.nombre) return alert("Falta nombre");

    await addDoc(collection(db, "inventario"), {
      nombre: nuevo.nombre,
      compra: Number(nuevo.compra || 0),
      venta: Number(nuevo.venta || 0),
      stock: Number(nuevo.stock || 0)
    });

    setNuevo({ nombre: "", compra: "", venta: "", stock: "" });
    cargar();
  };

  const filtrados = lista.filter((p) =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div style={{ padding: 20, color: "white" }}>
      <h1>📦 Inventario PRO</h1>

      <input
        placeholder="Buscar producto..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        style={{ marginBottom: 15 }}
      />

      {/* NUEVO PRODUCTO */}
      <div style={row}>
        <input
          placeholder="Nombre"
          value={nuevo.nombre}
          onChange={(e) =>
            setNuevo({ ...nuevo, nombre: e.target.value })
          }
        />

        <input
  placeholder="Precio compra"
  value={nuevo.compra}
  onChange={(e) =>
    setNuevo({ ...nuevo, compra: e.target.value })
  }
/>

        <input
          placeholder="Precio"
          value={nuevo.venta}
          onChange={(e) =>
            setNuevo({ ...nuevo, venta: e.target.value })
          }
        />

        <input
          placeholder="Stock"
          value={nuevo.stock}
          onChange={(e) =>
            setNuevo({ ...nuevo, stock: e.target.value })
          }
        />

        <button onClick={agregar}>➕</button>
      </div>

      <hr />

      {/* TABLA */}
      {filtrados.slice(0, 200).map((p) => (
        <div key={p.id} style={row}>
          <input
            value={p.nombre}
            onChange={(e) =>
              actualizarCampo(p.id, "nombre", e.target.value)
            }
          />
          // COMPRA

          <input
            value={p.compra}
            onChange={(e) =>
              actualizarCampo(p.id, "compra", e.target.value)
            }
          />
          
          <input
            value={p.venta}
            onChange={(e) =>
              actualizarCampo(p.id, "venta", e.target.value)
            }
          />

          <input
            value={p.stock}
            onChange={(e) =>
              actualizarCampo(p.id, "stock", e.target.value)
            }
          />

          <button
            onClick={() => eliminar(p.id)}
            style={btnDelete}
          >
            🗑
          </button>
        </div>
      ))}
    </div>
  );
}

const row = {
  display: "grid",
  gridTemplateColumns: "2fr 1fr 1fr auto",
  gap: "10px",
  marginBottom: "8px",
  background: "#111",
  padding: "10px",
  borderRadius: "8px"
};

const btnDelete = {
  background: "#ff2a2a",
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer"
};
