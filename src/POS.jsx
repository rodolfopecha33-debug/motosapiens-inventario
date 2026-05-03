// src/POS.jsx FACTURA PREMIUM

import React, { useEffect, useState } from "react";
import { db } from "./firebase";

import {
  collection,
  getDocs,
  addDoc,
  doc,
  updateDoc
} from "firebase/firestore";

export default function POS({ user }) {
  const [busqueda, setBusqueda] = useState("");
  const [carrito, setCarrito] = useState([]);
  const [lista, setLista] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarInventario();
  }, []);

  const cargarInventario = async () => {
    const snap = await getDocs(collection(db, "inventario"));
    const datos = [];

    snap.forEach((d) => {
      datos.push({
        id: d.id,
        ...d.data()
      });
    });

    setLista(datos);
    setCargando(false);
  };

  const nombre = (p) => p.nombre || "Sin nombre";
  const precio = (p) => Number(p.venta || 0);
  const stock = (p) => Number(p.stock || 0);

  const productosFiltrados = lista.filter((p) =>
    nombre(p).toLowerCase().includes(busqueda.toLowerCase())
  );

  const agregar = (p) => {
    if (stock(p) <= 0) {
      alert("Sin stock");
      return;
    }

    setCarrito([...carrito, p]);
  };

  const total = carrito.reduce(
    (sum, item) => sum + precio(item),
    0
  );

  const imprimirFactura = () => {
    const items = carrito
      .map(
        (p) =>
          `<tr>
            <td>${nombre(p)}</td>
            <td>$${precio(p)}</td>
          </tr>`
      )
      .join("");

    const html = `
      <html>
      <head>
        <title>Factura</title>
        <style>
          body{
            font-family:Arial;
            padding:30px;
          }
          h1{
            color:#e60000;
          }
          table{
            width:100%;
            border-collapse:collapse;
            margin-top:20px;
          }
          td,th{
            border:1px solid #ccc;
            padding:8px;
          }
          .total{
            font-size:22px;
            margin-top:20px;
            font-weight:bold;
          }
        </style>
      </head>
      <body>
        <h1>🏍️ MOTOSAPIENS</h1>
        <p>Evoluciona tu moto</p>
        <hr/>
        <p>Fecha: ${new Date().toLocaleString()}</p>
        <p>Vendedor: ${user}</p>

        <table>
          <tr>
            <th>Producto</th>
            <th>Valor</th>
          </tr>
          ${items}
        </table>

        <div class="total">
          TOTAL: $${total}
        </div>

        <br/>
        <p>Gracias por su compra</p>
      </body>
      </html>
    `;

    const win = window.open("", "", "width=800,height=900");
    win.document.write(html);
    win.document.close();
    win.print();
  };

  const cobrar = async () => {
    if (carrito.length === 0) return;

    for (const item of carrito) {
      await updateDoc(
        doc(db, "inventario", item.id),
        {
          stock: stock(item) - 1
        }
      );
    }

    await addDoc(collection(db, "ventas"), {
      fecha: new Date().toLocaleString(),
      usuario: user,
      productos: carrito,
      total: total
    });

    imprimirFactura();

    setCarrito([]);
    cargarInventario();
  };

  if (cargando) {
    return (
      <div style={{ padding:"30px", color:"white" }}>
        Cargando...
      </div>
    );
  }

  return (
    <div className="pos-layout">
      <div className="productos-panel">
        <h2>🛒 POS FACTURA PREMIUM</h2>

        <input
          placeholder="Buscar..."
          value={busqueda}
          onChange={(e) =>
            setBusqueda(e.target.value)
          }
        />

        <div className="productos-lista">
          {productosFiltrados.slice(0,80).map((p,i)=>(
            <button
              key={i}
              onClick={() => agregar(p)}
            >
              {nombre(p)} - ${precio(p)} | Stock:{stock(p)}
            </button>
          ))}
        </div>
      </div>

      <div className="carrito-panel">
        <h2>📦 Carrito</h2>

        {carrito.map((x,i)=>(
          <div
            key={i}
            className="item-carrito"
          >
            {nombre(x)} - ${precio(x)}
          </div>
        ))}

        <h3>Total: ${total}</h3>

        <button
          className="btn-cobrar"
          onClick={cobrar}
        >
          Cobrar + Factura
        </button>
      </div>
    </div>
  );
}
