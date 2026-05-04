import React, { useEffect, useState } from "react";
import { db } from "./firebase";
import { collection, getDocs } from "firebase/firestore";

export default function Kardex() {
  const [mov, setMov] = useState([]);

  useEffect(() => {
    cargar();
  }, []);

  const cargar = async () => {
    const snap = await getDocs(collection(db, "movimientos"));
    const datos = [];
    snap.forEach((d) => datos.push(d.data()));
    setMov(datos.reverse());
  };

  return (
    <div style={{ padding: 20, color: "white" }}>
      <h1>📊 Kardex (Movimientos)</h1>

      {mov.map((m, i) => (
        <div key={i} style={{ marginBottom: 10 }}>
          {m.fecha} | {m.tipo} | {m.producto} | {m.cantidad}
        </div>
      ))}
    </div>
  );
}
