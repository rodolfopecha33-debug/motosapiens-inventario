// src/POS.jsx WHATSAPP PRO

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
  const [telefono, setTelefono] = useState("");
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
    (sum, i) => sum + precio(i),
    0
  );

  const generarMensaje = () => {
    let mensaje = `🏍️ *MOTOSAPIENS*\n`;
    mensaje += `🧾 Factura\n\n`;

    carrito.forEach((p) => {
      mensaje += `• ${nombre(p)} - $${precio(p)}\n`;
    });

    mensaje += `\n💰 Total: $${total}\n`;
    mensaje += `👤 Atendido por: ${user}\n`;
    mensaje += `📅 ${new Date().toLocaleString()}\n`;
    mensaje += `\nGracias por su compra 🙌`;

    return encodeURIComponent(mensaje);
  };

  const enviarWhatsApp = () => {
    if (!telefono) {
      alert("Ingresa número cliente");
      return;
    }

    const msg = generarMensaje();

    const url = `https://wa.me/57${telefono}?text=${msg}`;

    window.open(url, "_blank");
  };

  const cobrar = async () => {
    if (carrito.length === 0) return;

    for (const item of carrito) {
      await updateDoc(doc(db, "inventario", item.id), {
        stock: stock(item) - 1
      });
    }

    await addDoc(collection(db, "ventas"), {
      fecha: new Date().toLocaleString(),
      usuario: user,
      productos: carrito,
      total: total
    });

    enviarWhatsApp();

    setCarrito([]);
    setTelefono("");
    cargarInventario();
  };

  if (cargando) {
    return (
      <div style={{ padding: "30px", color: "white" }}>
        Cargando...
      </div>
    );
  }

  return (
    <div className="pos-layout">
      <div className="productos-panel">
        <h2>📲 POS WHATSAPP PRO</h2>

        <input
          placeholder="Buscar..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />

        <div className="productos-lista">
          {productosFiltrados.slice(0, 80).map((p, i) => (
            <button key={i} onClick={() => agregar(p)}>
              {nombre(p)} - ${precio(p)} | Stock:{stock(p)}
            </button>
          ))}
        </div>
      </div>

      <div className="carrito-panel">
        <h2>📦 Carrito</h2>

        {carrito.map((x, i) => (
          <div key={i} className="item-carrito">
            {nombre(x)} - ${precio(x)}
          </div>
        ))}

        <h3>Total: ${total}</h3>

        <input
          placeholder="Número cliente (ej: 3001234567)"
          value={telefono}
          onChange={(e) => setTelefono(e.target.value)}
          style={{
            width: "100%",
            padding: "10px",
            marginBottom: "10px",
            borderRadius: "8px"
          }}
        />

        <button
          className="btn-cobrar"
          onClick={cobrar}
        >
          Cobrar + WhatsApp
        </button>
      </div>
    </div>
  );
}
