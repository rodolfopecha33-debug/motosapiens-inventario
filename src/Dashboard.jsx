// src/Dashboard.jsx PRO MAX

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

  const total = ventas.reduce(
    (sum, v) => sum + Number(v.total || 0),
    0
  );

  const cantidadVentas = ventas.length;

  const exportarCSV = () => {
    let csv =
      "Fecha,Usuario,Total,Productos\n";

    ventas.forEach((v) => {
      csv += `${v.fecha},${v.usuario},${v.total},${v.productos?.length || 0}\n`;
    });

    const blob = new Blob([csv], {
      type: "text/csv"
    });

    const url =
      window.URL.createObjectURL(blob);

    const a =
      document.createElement("a");

    a.href = url;
    a.download = "ventas.csv";
    a.click();
  };

  const imprimir = () => {
    window.print();
  };

  return (
    <div style={{ padding:"25px", color:"white" }}>
      <h1>📊 Dashboard PRO MAX</h1>

      <br />

      <div
        style={{
          display:"grid",
          gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",
          gap:"15px"
        }}
      >
        <Card
          titulo="💰 Total Ventas"
          valor={`$${total}`}
        />

        <Card
          titulo="🧾 Cantidad"
          valor={cantidadVentas}
        />

        <Card
          titulo="📦 Productos"
          valor={ventas.reduce(
            (sum,v)=>
              sum +
              (v.productos?.length || 0),
            0
          )}
        />
      </div>

      <br />

      <div
        style={{
          display:"flex",
          gap:"10px",
          flexWrap:"wrap"
        }}
      >
        <button
          onClick={exportarCSV}
          style={btn()}
        >
          📥 Exportar Excel
        </button>

        <button
          onClick={imprimir}
          style={btn()}
        >
          🖨️ Imprimir PDF
        </button>

        <button
          onClick={cargarVentas}
          style={btn()}
        >
          🔄 Actualizar
        </button>
      </div>

      <br />

      <table
        style={{
          width:"100%",
          borderCollapse:"collapse",
          background:"#111"
        }}
      >
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Usuario</th>
            <th>Total</th>
            <th>Items</th>
          </tr>
        </thead>

        <tbody>
          {ventas.map((v,i)=>(
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

function Card({ titulo, valor }) {
  return (
    <div
      style={{
        background:"#111",
        padding:"20px",
        borderRadius:"14px"
      }}
    >
      <h3>{titulo}</h3>
      <h2>{valor}</h2>
    </div>
  );
}

function btn() {
  return {
    background:"#16b84e",
    color:"white",
    border:"none",
    padding:"12px 18px",
    borderRadius:"10px",
    cursor:"pointer"
  };
}
