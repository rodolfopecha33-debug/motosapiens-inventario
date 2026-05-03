// src/Dashboard.jsx

import React, { useEffect, useState } from "react";
import { db } from "./firebase";

import {
  collection,
  getDocs
} from "firebase/firestore";

export default function Dashboard() {
  const [ventas, setVentas] = useState([]);

  useEffect(() => {
    cargarVentas();
  }, []);

  const cargarVentas = async () => {
    const querySnapshot = await getDocs(
      collection(db, "ventas")
    );

    const datos = [];

    querySnapshot.forEach((doc) => {
      datos.push({
        id: doc.id,
        ...doc.data()
      });
    });

    setVentas(datos.reverse());
  };

  const totalHoy = ventas.reduce(
    (sum, v) => sum + Number(v.total || 0),
    0
  );

  return (
    <div style={{ padding: "25px" }}>
      <h1>📊 Dashboard Ventas</h1>

      <h2>
        Total registrado: ${totalHoy}
      </h2>

      <br />

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse"
        }}
      >
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Usuario</th>
            <th>Total</th>
            <th>Productos</th>
          </tr>
        </thead>

        <tbody>
          {ventas.map((v, i) => (
            <tr key={i}>
              <td>{v.fecha}</td>
              <td>{v.usuario}</td>
              <td>${v.total}</td>
              <td>
                {v.productos?.length || 0}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
