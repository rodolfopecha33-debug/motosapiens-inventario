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
  const codigo = (p) => String(p.codigo || p.barras || "");

  const productosFiltrados = lista.filter((p) =>
    nombre(p).toLowerCase().includes(busqueda.toLowerCase()) ||
    codigo(p).includes(busqueda)
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
    let mensaje = `🏍️ *MOTOSAPIENS*\n🧾 Factura\n\n`;

    carrito.forEach((p) => {
      mensaje += `• ${nombre(p)} - $${precio(p)}\n`;
    });

    mensaje += `\n💰 Total: $${total}\n`;
    mensaje += `👤 Vendedor: ${user}\n`;
    mensaje += `📅 ${new Date().toLocaleString()}\n`;
    mensaje += `\nGracias por su compra 🙌`;

    return encodeURIComponent(mensaje);
  };

  const enviarWhatsApp = () => {
    if (!telefono) return;

    const url = `https://wa.me/57${telefono}?text=${generarMensaje()}`;
    window.open(url, "_blank");
  };

  const imprimirFactura = () => {
    const items = carrito
      .map(
        (p) =>
          `<tr><td>${nombre(p)}</td><td>$${precio(p)}</td></tr>`
      )
      .join("");

    const html = `
    <html>
    <body style="font-family:Arial;padding:20px">
      <h1 style="color:red">🏍️ MOTOSAPIENS</h1>
      <p>${new Date().toLocaleString()}</p>
      <p>Vendedor: ${user}</p>
      <table border="1" width="100%" style="border-collapse:collapse">
        <tr><th>Producto</th><th>Valor</th></tr>
        ${items}
      </table>
      <h2>Total: $${total}</h2>
    </body>
    </html>
    `;

    const win = window.open("", "", "width=800,height=900");
    win.document.write(html);
    win.print();
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

    imprimirFactura();
    enviarWhatsApp();

    setCarrito([]);
    setTelefono("");
    cargarInventario();
  };

  if (cargando) {
    return <div style={{ padding: 30 }}>Cargando...</div>;
  }

  return (
    <div className="pos-layout">
      <div className="productos-panel">
        <h2>🔥 POS FINAL TODO</h2>

        <div style={{ display: "flex", gap: 10 }}>
          <input
            placeholder="Buscar o escanear código..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />

          <button
            onClick={() =>
              alert("Escanea con lector físico o escribe código")
            }
          >
            📷
          </button>
        </div>

        <div className="productos-lista">
          {productosFiltrados.slice(0, 80).map((p, i) => (
            <button key={i} onClick={() => agregar(p)}>
             {nombre(p)} - ${precio(p)} | Stock:{stock(p)}
{stock(p) <= 5 && (
  <span style={{ color: "red", marginLeft: "10px" }}>
    ⚠️ Bajo
  </span>
)}
            </button>
          ))}
        </div>
      </div>

      <div className="carrito-panel">
        <h2>📦 Carrito</h2>

        {carrito.map((x, i) => (
          <div key={i}>
            {nombre(x)} - ${precio(x)}
          </div>
        ))}

        <h3>Total: ${total}</h3>

        <input
          placeholder="Cliente WhatsApp (300...)"
          value={telefono}
          onChange={(e) => setTelefono(e.target.value)}
        />

        <button className="btn-cobrar" onClick={cobrar}>
          Cobrar + Factura + WhatsApp
        </button>
      </div>
    </div>
  );
}
