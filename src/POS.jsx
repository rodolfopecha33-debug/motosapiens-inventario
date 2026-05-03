import React, { useState } from "react";
import productos from "./data";

export default function POS({ user }) {
  const [busqueda, setBusqueda] = useState("");
  const [carrito, setCarrito] = useState([]);

  const obtenerNombre = (p) =>
    p.nombre || p.producto || p.descripcion || "Sin nombre";

  const obtenerPrecio = (p) =>
    Number(
      p.precio ||
      p.valor ||
      p.precioVenta ||
      p.precio_venta ||
      p.vr_venta ||
      0
    );

  const obtenerStock = (p) =>
    Number(
      p.stock ||
      p.cantidad ||
      p.existencia ||
      p.saldo ||
      p.inventario ||
      p.disponible ||
      0
    );

  const lista = productos.filter((p) =>
    obtenerNombre(p).toLowerCase().includes(busqueda.toLowerCase())
  );

  const agregar = (producto) => {
    setCarrito([...carrito, producto]);
  };

  const total = carrito.reduce(
    (sum, item) => sum + obtenerPrecio(item),
    0
  );

  return (
    <div className="pos-layout">
      <div className="productos-panel">
        <h2>🛒 Caja de Ventas</h2>

        <input
          type="text"
          placeholder="Buscar producto..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />

        <div className="productos-lista">
          {lista.slice(0,80).map((p,i)=>(
            <button key={i} onClick={()=>agregar(p)}>
              {obtenerNombre(p)} - ${obtenerPrecio(p)} | Stock: {obtenerStock(p)}
            </button>
          ))}
        </div>
      </div>

      <div className="carrito-panel">
        <h2>📦 Carrito</h2>

        {carrito.map((item,i)=>(
          <div key={i} className="item-carrito">
            {obtenerNombre(item)} - ${obtenerPrecio(item)}
          </div>
        ))}

        <h3>Total: ${total}</h3>

        <button className="btn-cobrar">
          Cobrar
        </button>
      </div>
    </div>
  );
}
