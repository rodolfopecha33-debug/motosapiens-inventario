import React, { useEffect, useState } from "react";

import { db } from "./firebase";

import {
  collection,
  getDocs
} from "firebase/firestore";

export default function Kardex() {

  const [mov, setMov] = useState([]);

  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    cargar();
  }, []);

  // 🔥 CARGAR
  const cargar = async () => {

    const snap = await getDocs(
      collection(db, "movimientos")
    );

    const datos = [];

    snap.forEach((d) => {

      datos.push({
        id: d.id,
        ...d.data()
      });

    });

    setMov(datos.reverse());
  };

  // 🔍 FILTRO
  const filtrados = mov.filter((m) =>

    (
      m.producto || ""
    )
      .toLowerCase()
      .includes(
        busqueda.toLowerCase()
      )

  );

  // 🎨 COLOR TIPO
  const colorTipo = (tipo) => {

    switch (tipo) {

      case "venta":
        return "#ff4444";

      case "entrada":
        return "#16b84e";

      case "garantia":
        return "#ff9800";

      case "devolucion":
        return "#1e90ff";

      default:
        return "#999";
    }
  };

  return (
    <div className="kardex-container">

      <h1>📊 KARDEX PRO MAX</h1>

      {/* BUSCAR */}
      <input
        className="buscar-kardex"
        placeholder="Buscar producto..."
        value={busqueda}
        onChange={(e)=>
          setBusqueda(e.target.value)
        }
      />

      {/* HEADERS */}
      <div className="kardex-row kardex-header">

        <div>Fecha</div>

        <div>Producto</div>

        <div>Tipo</div>

        <div>Cantidad</div>

        <div>Usuario</div>

        <div>Stock Final</div>

      </div>

      {/* MOVIMIENTOS */}
      {filtrados.map((m, i) => (

        <div
          key={i}
          className="kardex-row"
        >

          {/* FECHA */}
          <div>
            {m.fecha || "-"}
          </div>

          {/* PRODUCTO */}
          <div>
            {m.producto || "-"}
          </div>

          {/* TIPO */}
          <div>

            <span
              className="tipo-badge"
              style={{
                background:
                  colorTipo(m.tipo)
              }}
            >
              {m.tipo}
            </span>

          </div>

          {/* CANTIDAD */}
          <div
            style={{
              color:
                Number(m.cantidad) > 0
                  ? "#16b84e"
                  : "#ff4444",

              fontWeight: "bold"
            }}
          >

            {Number(m.cantidad) > 0
              ? "+"
              : ""}

            {m.cantidad}

          </div>

          {/* USUARIO */}
          <div>
            {m.usuario || "Sistema"}
          </div>

          {/* STOCK FINAL */}
          <div>
            {m.stockFinal || "-"}
          </div>

        </div>

      ))}

    </div>
  );
}
