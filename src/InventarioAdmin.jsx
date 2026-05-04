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

  const guardar = async (item) => {
    await updateDoc(doc(db, "inventario", item.id), item);
    alert("Actualizado");
  };

  const eliminar = async (id) => {
    if (!confirm("Eliminar producto?")) return;

    await deleteDoc(doc(db, "inventario", id));
    cargar();
  };

  const agregar = async () => {
    if (!nuevo.nombre) return alert("Falta nombre");

    await addDoc(collection(db, "inventario"), {
      ...nuevo,
      venta: Number(nuevo.venta),
      stock: Number(nuevo.stock)
    });

    setNuevo({ nombre: "", venta: "", stock: "" });
    cargar();
  };

  const filtrados = lista.filter((p) =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div style={{ padding: 20, color: "white" }}>
      <h1>📦 Inventario ADMIN</h1>

      <input
        placeholder="Buscar..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
      />

      <h3>➕ Nuevo producto</h3>

      <input
        placeholder="Nombre"
        value={nuevo.nombre}
        onChange={(e) =>
          setNuevo({ ...nuevo, nombre: e.target.value })
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

      <button onClick={agregar}>Agregar</button>

      <hr />

      {filtrados.slice(0, 200).map((p) => (
        <div
          key={p.id}
          style={{
            marginBottom: 10,
            background: "#111",
            padding: 10
          }}
        >
          <input
            value={p.nombre}
            onChange={(e) =>
              (p.nombre = e.target.value)
            }
          />

          <input
            value={p.venta}
            onChange={(e) =>
              (p.venta = e.target.value)
            }
          />

          <input
            value={p.stock}
            onChange={(e) =>
              (p.stock = e.target.value)
            }
          />

          <button onClick={() => guardar(p)}>
            Guardar
          </button>

          <button onClick={() => eliminar(p.id)}>
            Eliminar
          </button>
        </div>
      ))}
    </div>
  );
}
