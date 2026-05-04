import React, { useEffect, useState } from "react";
import { db } from "./firebase";
import ConfirmModal from "./ConfirmModal";

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
  const [mostrarConfirm, setMostrarConfirm] = useState(false);

  const [metodoPago, setMetodoPago] = useState("efectivo");
  const [recibido, setRecibido] = useState("");

  useEffect(() => {
    cargarInventario();
  }, []);

  const cargarInventario = async () => {
    const snap = await getDocs(collection(db, "inventario"));
    const datos = [];
    snap.forEach((d) =>
      datos.push({ id: d.id, ...d.data() })
    );
    setLista(datos);
    setCargando(false);
  };

  const nombre = (p) => p.nombre || "Sin nombre";
  const precio = (p) => Number(p.venta || 0);
  const stock = (p) => Number(p.stock || 0);
  const codigo = (p) => String(p.codigo || "");

  const productosFiltrados = lista.filter((p) =>
    nombre(p).toLowerCase().includes(busqueda.toLowerCase()) ||
    codigo(p).includes(busqueda)
  );

  // 🛒 AGREGAR PRODUCTO
  const agregar = (p) => {
    if (stock(p) <= 0) {
      alert("Sin stock");
      return;
    }

    const existe = carrito.find((i) => i.id === p.id);

    if (existe) {
      setCarrito(
        carrito.map((i) =>
          i.id === p.id
            ? { ...i, cantidad: i.cantidad + 1 }
            : i
        )
      );
    } else {
      setCarrito([...carrito, { ...p, cantidad: 1 }]);
    }
  };

  const aumentar = (id) => {
    setCarrito(
      carrito.map((i) =>
        i.id === id
          ? { ...i, cantidad: i.cantidad + 1 }
          : i
      )
    );
  };

  const disminuir = (id) => {
    const item = carrito.find((i) => i.id === id);

    if (item.cantidad === 1) {
      eliminar(id);
      return;
    }

    setCarrito(
      carrito.map((i) =>
        i.id === id
          ? { ...i, cantidad: i.cantidad - 1 }
          : i
      )
    );
  };

  const eliminar = (id) => {
    setCarrito(carrito.filter((i) => i.id !== id));
  };

  const total = carrito.reduce(
    (sum, i) => sum + precio(i) * i.cantidad,
    0
  );

  const cambio =
    metodoPago === "efectivo"
      ? Number(recibido || 0) - total
      : 0;

  const generarMensaje = () => {
    let mensaje = `🏍️ *MOTOSAPIENS*\n🧾 Factura\n\n`;

    carrito.forEach((p) => {
      mensaje += `• ${nombre(p)} x${p.cantidad} - $${precio(p) * p.cantidad}\n`;
    });

    mensaje += `\n💰 Total: $${total}\n`;
    mensaje += `💳 Pago: ${metodoPago}\n`;
    mensaje += `👤 ${user}\n`;

    return encodeURIComponent(mensaje);
  };

  const enviarWhatsApp = () => {
    if (!telefono) return;
    window.open(`https://wa.me/57${telefono}?text=${generarMensaje()}`, "_blank");
  };

  const imprimirFactura = () => {
    const items = carrito.map((p) =>
      `<tr>
        <td>${nombre(p)}</td>
        <td>${p.cantidad}</td>
        <td>$${precio(p) * p.cantidad}</td>
      </tr>`
    ).join("");

    const html = `
    <html>
      <body style="font-family:Arial;padding:20px">
        <h1 style="color:red">MOTOSAPIENS</h1>
        <p>${new Date().toLocaleString()}</p>
        <table border="1" width="100%">
          <tr><th>Producto</th><th>Cant</th><th>Total</th></tr>
          ${items}
        </table>
        <h2>Total: $${total}</h2>
      </body>
    </html>
    `;

    const win = window.open("", "", "width=800,height=900");
    win.document.write(html);
    win.document.close();
    win.print();
  };

  const ejecutarVenta = async () => {
    if (carrito.length === 0) return;

    if (metodoPago === "efectivo" && Number(recibido) < total) {
      alert("Dinero insuficiente");
      return;
    }

    for (const item of carrito) {
      await updateDoc(doc(db, "inventario", item.id), {
        stock: stock(item) - item.cantidad
      });

      await addDoc(collection(db, "movimientos"), {
        tipo: "venta",
        producto: item.nombre,
        cantidad: item.cantidad,
        fecha: new Date().toLocaleString()
      });
    }

    await addDoc(collection(db, "ventas"), {
      fecha: new Date().toLocaleString(),
      usuario: user,
      productos: carrito,
      total,
      metodoPago,
      recibido: Number(recibido || 0),
      cambio
    });

    imprimirFactura();
    enviarWhatsApp();

    setCarrito([]);
    setTelefono("");
    setRecibido("");
    setMetodoPago("efectivo");

    cargarInventario();
  };

  if (cargando) {
    return <div style={{ padding: 30 }}>Cargando...</div>;
  }

  return (
    <div className="pos-layout">
      {/* PRODUCTOS */}
      <div className="productos-panel">
        <h2>🔥 POS FINAL PRO</h2>

        <input
          placeholder="Buscar o escanear..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />

        <div className="productos-lista">
          {productosFiltrados.slice(0, 80).map((p, i) => (
            <button
              key={i}
              onClick={() => agregar(p)}
              className="producto-card"
            >
              <div className="producto-info">
                <span>{nombre(p)}</span>
                <span style={{ color: "#00ff88" }}>
                  ${precio(p)}
                </span>
              </div>

              <div className="producto-extra">
                <span>Stock: {stock(p)}</span>

                {stock(p) <= 5 && (
                  <span style={{ color: "red" }}>
                    ⚠ Bajo
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* CARRITO */}
      <div className="carrito-panel">
        <h2>📦 Carrito</h2>

        {carrito.length === 0 && (
          <p style={{ color: "#aaa" }}>
            🛒 No hay productos
          </p>
        )}

        {carrito.map((x, i) => (
          <div key={i} style={itemStyle}>
            <div>
              {nombre(x)} <br />
              ${precio(x)} x {x.cantidad}
            </div>

            <div>
              <button onClick={() => disminuir(x.id)}>➖</button>
              <button onClick={() => aumentar(x.id)}>➕</button>
              <button onClick={() => eliminar(x.id)}>🗑</button>
            </div>
          </div>
        ))}

        <h3>Total: ${total}</h3>

        <select
          value={metodoPago}
          onChange={(e) => setMetodoPago(e.target.value)}
        >
          <option value="efectivo">Efectivo</option>
          <option value="nequi">Nequi</option>
          <option value="tarjeta">Tarjeta</option>
        </select>

        {metodoPago === "efectivo" && (
          <>
            <input
              placeholder="Dinero recibido"
              value={recibido}
              onChange={(e) => setRecibido(e.target.value)}
            />
            <p>
              Cambio:{" "}
              <strong style={{ color: cambio < 0 ? "red" : "#16b84e" }}>
                ${cambio}
              </strong>
            </p>
          </>
        )}

        <input
          placeholder="Cliente WhatsApp"
          value={telefono}
          onChange={(e) => setTelefono(e.target.value)}
        />

        <button
          onClick={() => setMostrarConfirm(true)}
          disabled={carrito.length === 0}
          className="btn-cobrar"
        >
          Cobrar + Factura
        </button>
      </div>

      <ConfirmModal
        open={mostrarConfirm}
        total={total}
        message="¿Confirmar venta?"
        onCancel={() => setMostrarConfirm(false)}
        onConfirm={async () => {
          setMostrarConfirm(false);
          await ejecutarVenta();
        }}
      />
    </div>
  );
}

const itemStyle = {
  display: "flex",
  justifyContent: "space-between",
  marginBottom: "10px",
  background: "#111",
  padding: "10px",
  borderRadius: "8px"
};
