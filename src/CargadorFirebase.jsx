// src/CargadorFirebase.jsx

import React, { useState } from "react";
import productos from "./data";
import { db } from "./firebase";

import {
  doc,
  setDoc
} from "firebase/firestore";

export default function CargadorFirebase() {
  const [subiendo, setSubiendo] =
    useState(false);

  const subir = async () => {
    setSubiendo(true);

    for (const item of productos) {
      await setDoc(
        doc(
          db,
          "inventario",
          String(item.codigo)
        ),
        item
      );
    }

    alert(
      "Inventario cargado correctamente"
    );

    setSubiendo(false);
  };

  return (
    <div style={{ padding:"30px" }}>
      <h1>
        🚀 Cargar Inventario Firebase
      </h1>

      <p>
        Productos a subir:
        {productos.length}
      </p>

      <button
        onClick={subir}
        disabled={subiendo}
        style={{
          background:"#16b84e",
          color:"white",
          border:"none",
          padding:"14px 20px",
          borderRadius:"10px",
          cursor:"pointer"
        }}
      >
        {subiendo
          ? "Subiendo..."
          : "Subir Inventario"}
      </button>
    </div>
  );
}
