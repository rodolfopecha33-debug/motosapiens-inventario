import React, { useEffect, useState } from "react";
import { db } from "./firebase";
import {
  collection,
  getDocs,
  addDoc,
  doc,
  updateDoc
} from "firebase/firestore";

export default function Compras() {
  const [lista, setLista] = useState([]);
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    cargar();
  }, []);

  const cargar = async () => {
    const snap = await getDocs(collection(db, "inventario"));
    const datos = [];
    snap.forEach((d) => datos.push({ id: d.id, ...d.data() }));
    setLista(datos);
  };

  const comprar = async (p, cantidad) => {
    if (!cantidad || cantidad <= 0) return;

    const nuevoStock = Number(p.stock || 0) + Number(cantidad);

    // actualizar inventario
    await updateDoc(doc(db, "inventario", p.id), {
      stock: nuevoStock,
      compra: Number(p.compra || 0)
    });

    // registrar movimiento
    await addDoc(collection(db, "movimientos"), {
      tipo: "compra",
      producto: p.nombre,
      cantidad: Number(cantidad),
      fecha: new Date().toLocaleString()
    });

    alert("Compra registrada");
    cargar();
  };

  const filtrados = lista.filter((p) =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div style={{ padding: 20, color: "white" }}>
      <h1>📦 Compras ERP</h1>

      <input
        placeholder="Buscar producto..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
      />

      {filtrados.slice(0, 100).map((p) => (
        <Item key={p.id} p={p} comprar={comprar} />
      ))}
    </div>
  );
}

function Item({ p, comprar }) {
  const [cant, setCant] = useState("");

  return (
    <div style={{ marginBottom: 10, background: "#111", padding: 10 }}>
      <strong>{p.nombre}</strong> | Stock: {p.stock}

      <br />

      <input
        placeholder="Cantidad"
        value={cant}
        onChange={(e) => setCant(e.target.value)}
      />

      <button onClick={() => comprar(p, cant)}>
        Comprar
      </button>
    </div>
  );
}
