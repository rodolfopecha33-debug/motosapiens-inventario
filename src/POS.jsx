import React, { useState } from "react";
import productos from "./data";

export default function POS({ user }) {
  const [busqueda, setBusqueda] = useState("");
  const [carrito, setCarrito] = useState([]);

  const nombre = (p) =>
    p.nombre ||
    p.producto ||
    p.descripcion ||
    p.DESCRIPCION ||
    "Sin nombre";

 const precio = (p) => Number(p.venta || 0);
  

  const stock = (p) =>
    Number(
      p.stock ||
      p.cantidad ||
      p.existencia ||
      p.saldo ||
      p.inventario ||
      0
    );

  const lista = productos.filter((p) =>
    nombre(p).toLowerCase().includes(busqueda.toLowerCase())
  );

  const agregar = (item) => setCarrito([...carrito, item]);

  const total = carrito.reduce((sum, i) => sum + precio(i), 0);

  return (
    <div className="pos-layout">
      <div className="productos-panel">
        <h2>🛒 Caja de Ventas</h2>

        <input
          placeholder="Buscar producto..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />

        <div className="productos-lista">
          {lista.slice(0,80).map((p,i)=>(
            <button key={i} onClick={()=>agregar(p)}>
              {nombre(p)} - ${precio(p)} | Stock: {stock(p)}
            </button>
          ))}
        </div>
      </div>

      <div className="carrito-panel">
        <h2>📦 Carrito</h2>

        {carrito.map((x,i)=>(
          <div key={i} className="item-carrito">
            {nombre(x)} - ${precio(x)}
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
