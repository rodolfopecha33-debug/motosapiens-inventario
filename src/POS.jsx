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
    snap.forEach((d) => datos.push({ id: d.id, ...d.data() }));
    setLista(datos);
    setCargando(false);
  };

  const nombre = (p) => p.nombre || "Sin nombre";
  const precio = (p) => Number(p.venta || 0);
  const stock = (p) => Number(p.stock || 0);
  const codigo = (p) => String(p.codigo || "");

  const productosFiltrados = lista.filter(
    (p) =>
      nombre(p).toLowerCase().includes(busqueda.toLowerCase()) ||
      codigo(p).includes(busqueda)
  );

  const agregar = (p) => {
    if (stock(p) <= 0) {
      alert("Sin stock");
      return;
    }

    const existe = carrito.find((i) => i.id === p.id);

    if (existe) {
      setCarrito(
        carrito.map((i) =>
          i.id === p.id ? { ...i, cantidad: i.cantidad + 1 } : i
        )
      );
    } else {
      setCarrito([...carrito, { ...p, cantidad: 1 }]);
    }
  };

  const aumentar = (id) => {
    setCarrito(
      carrito.map((i) =>
        i.id === id ? { ...i, cantidad: i.cantidad + 1 } : i
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
        i.id === id ? { ...i, cantidad: i.cantidad - 1 } : i
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

    setCarrito([]);
    setTelefono("");
    setRecibido("");
    setMetodoPago("efectivo");

    cargarInventario();
  };

  if (cargando) return <div style={{ padding: 30 }}>Cargando...</div>;

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
          {productosFiltrados.slice(0, 80).map((p) => (
            <div
              key={p.id}
              className="producto-card-max"
              onClick={() => agregar(p)}
            >
              {/* IZQUIERDA */}
              <div className="producto-left">
                <div className="producto-img">🏍️</div>

                <div className="producto-text">
                  <div className="producto-nombre">
                    {nombre(p)}
                  </div>

                  <div className="producto-sub">
                    Ref: {p.codigo || "N/A"}
                  </div>

                  <div className="producto-stock">
                    Stock: {stock(p)}
                  </div>
                </div>
              </div>

              {/* DERECHA */}
              <div className="producto-right-max">
                <div className="precio-row">
                  <span className="producto-precio">
                    ${precio(p)}
                  </span>

                  <button
                    className="btn-add-max"
                    onClick={(e) => {
                      e.stopPropagation();
                      agregar(p);
                    }}
                  >
                    +
                  </button>
                </div>

                {stock(p) <= 5 && (
                  <span className="badge-stock-max">
                    ⚠ Bajo
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CARRITO */}
      <div className="carrito-panel">
        <h2>📦 Carrito</h2>

        {carrito.length === 0 && (
          <p className="empty">🛒 No hay productos</p>
        )}

        {carrito.map((x) => (
          <div key={x.id} className="carrito-item">
            <div>
              {nombre(x)}
              <br />
              <span className="precio-mini">
                ${precio(x)} x {x.cantidad}
              </span>
            </div>

            <div className="acciones">
              <button onClick={() => disminuir(x.id)}>−</button>
              <button onClick={() => aumentar(x.id)}>+</button>
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
          <option value="daviplata">Daviplata</option>
          <option value="tarjeta">Tarjeta</option>
        </select>

        {metodoPago === "efectivo" && (
          <>
            <input
              placeholder="Dinero recibido"
              value={recibido}
              onChange={(e) => setRecibido(e.target.value)}
            />
            <p className="cambio">
              Cambio: ${cambio}
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
          Cobrar
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
