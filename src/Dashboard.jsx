// src/Dashboard.jsx GANANCIAS PRO

import React, { useEffect, useState } from "react";
import { db } from "./firebase";
import { resetVentas } from "./resetDB";


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
    const snap = await getDocs(
      collection(db, "ventas")
    );

    const datos = [];

    snap.forEach((doc) => {
      datos.push({
        id: doc.id,
        ...doc.data()
      });
    });

    setVentas(datos.reverse());
  };

  const totalVentas = ventas.reduce(
    (sum, v) => sum + Number(v.total || 0),
    0
  );

  const totalItems = ventas.reduce(
    (sum, v) =>
      sum + (v.productos?.length || 0),
    0
  );

  const totalGanancia = ventas.reduce(
    (sum, venta) =>
      sum +
      (venta.productos || []).reduce(
        (g, p) =>
          g +
          (Number(p.venta || 0) -
            Number(p.compra || 0)),
        0
      ),
    0
  );

  const exportarCSV = () => {
    let csv =
      "Fecha,Usuario,Total,Ganancia,Items\n";

    ventas.forEach((v) => {
      const gan =
        (v.productos || []).reduce(
          (g, p) =>
            g +
            (Number(p.venta || 0) -
              Number(p.compra || 0)),
          0
        );

      csv += `${v.fecha},${v.usuario},${v.total},${gan},${v.productos?.length || 0}\n`;
    });

    const blob = new Blob([csv], {
      type: "text/csv"
    });

    const url =
      URL.createObjectURL(blob);

    const a =
      document.createElement("a");

    a.href = url;
    a.download =
      "ganancias.csv";
    a.click();
  };

  const totalEfectivo = ventas
  .filter(v => v.metodoPago === "efectivo")
  .reduce((acc, v) => acc + Number(v.total || 0), 0);

const totalNequi = ventas
  .filter(v => v.metodoPago === "nequi")
  .reduce((acc, v) => acc + Number(v.total || 0), 0);

const totalDaviplata = ventas
  .filter(v => v.metodoPago === "daviplata")
  .reduce((acc, v) => acc + Number(v.total || 0), 0);

const totalTarjeta = ventas
  .filter(v => v.metodoPago === "tarjeta")
  .reduce((acc, v) => acc + Number(v.total || 0), 0);
  
  return (
    <div style={{ padding:"25px", color:"white" }}>
      <h1>
        📊 Dashboard Ganancias PRO
      </h1>

      <br />

      <div
        style={{
          display:"grid",
          gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",
          gap:"15px"
        }}
      >
        <Card
          titulo="💰 Ventas"
          valor={`$${totalVentas}`}
        />

        <Card
          titulo="📈 Ganancia"
          valor={`$${totalGanancia}`}
        />

        <Card
          titulo="📦 Items"
          valor={totalItems}
        />

        <Card
          titulo="🧾 Ventas"
          valor={ventas.length}
        />
      </div>

      <div className="grid-pagos">

  <div className="card pago-efectivo">
    💵 Efectivo
    <h2>${totalEfectivo}</h2>
  </div>

  <div className="card pago-nequi">
    📱 Nequi
    <h2>${totalNequi}</h2>
  </div>

  <div className="card pago-daviplata">
    🟥 Daviplata
    <h2>${totalDaviplata}</h2>
  </div>

  <div className="card pago-tarjeta">
    💳 Tarjeta
    <h2>${totalTarjeta}</h2>
  </div>

</div>

      <br />

      <button
        onClick={exportarCSV}
        style={btn()}
      >
        📥 Exportar Excel
      </button>

      <br /><br />

      <button
  onClick={resetVentas}
  style={{
    background: "#ff2a2a",
    color: "white",
    padding: "10px",
    borderRadius: "8px",
    marginTop: "10px"
  }}
>
  🧨 Reset Ventas
</button>
      
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
            <th>Ganancia</th>
            <th>Método</th>
          </tr>
        </thead>

        <tbody>
          {ventas.map((v,i)=>{
            const gan =
              (v.productos || []).reduce(
                (g,p)=>
                  g +
                  (Number(p.venta||0) -
                   Number(p.compra||0)),
                0
              );

            return (
              <tr key={i}>
                <td>{v.fecha}</td>
                <td>{v.usuario}</td>
                <td>${v.total}</td>
                <td>${gan}</td>
                 <td>
       <span className={`pago ${v.metodoPago}`}>
    {v.metodoPago}
  </span>
      </td>
              </tr>
            );
          })}
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
