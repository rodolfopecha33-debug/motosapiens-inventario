import React, { useEffect, useState } from "react";
import { db } from "./firebase";

import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  addDoc
} from "firebase/firestore";

export default function InventarioAdmin() {

  const [lista, setLista] = useState([]);
  const [busqueda, setBusqueda] = useState("");

  const [nuevo, setNuevo] = useState({
    nombre: "",
    compra: "",
    venta: "",
    stock: "",
    categoria: "",
    marca: "",
    proveedor: ""
  });

  useEffect(() => {
    cargar();
  }, []);

  // 🔥 CARGAR INVENTARIO
  const cargar = async () => {

    const snap = await getDocs(
      collection(db, "inventario")
    );

    const datos = [];

    snap.forEach((d) => {
      datos.push({
        id: d.id,
        ...d.data()
      });
    });

    setLista(datos);
  };

  // 🔥 CAMBIOS LOCALES
  const cambiarLocal = (id, campo, valor) => {

    setLista((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, [campo]: valor }
          : p
      )
    );
  };

  // 💾 GUARDAR
  const guardar = async (p) => {

    try {

      await updateDoc(
        doc(db, "inventario", p.id),
        {
          nombre: p.nombre,

          compra: Number(p.compra || 0),

          venta: Number(p.venta || 0),

          stock: Number(p.stock || 0),

          categoria: p.categoria || "",

          marca: p.marca || "",

          proveedor: p.proveedor || ""
        }
      );

      alert("✅ Guardado");

    } catch (error) {

      console.error(error);

      alert("❌ Error");

    }
  };

  // 🗑 ELIMINAR
  const eliminar = async (id, nombre) => {

    const ok = window.confirm(
      `⚠️ ¿Seguro de eliminar?\n\n${nombre}`
    );

    if (!ok) return;

    try {

      await deleteDoc(
        doc(db, "inventario", id)
      );

      setLista(
        lista.filter((p) => p.id !== id)
      );

      alert("✅ Producto eliminado");

    } catch (error) {

      console.error(error);

      alert("❌ Error eliminando");

    }
  };

  // ➕ AGREGAR PRODUCTO
  const agregar = async () => {

    if (!nuevo.nombre) {
      return alert("Falta nombre");
    }

    try {

      // 🔥 OBTENER ÚLTIMO CÓDIGO
      let ultimo = 100000;

      lista.forEach((p) => {

        if (p.codigo) {

          const num = Number(
            String(p.codigo).replace("A", "")
          );

          if (num > ultimo) {
            ultimo = num;
          }
        }
      });

      const nuevoCodigo = `A${ultimo + 1}`;

      // 🔥 GUARDAR
      await addDoc(
        collection(db, "inventario"),
        {

          codigo: nuevoCodigo,

          nombre: nuevo.nombre,

          compra: Number(nuevo.compra || 0),

          venta: Number(nuevo.venta || 0),

          stock: Number(nuevo.stock || 0),

          categoria: nuevo.categoria || "",

          marca: nuevo.marca || "",

          proveedor: nuevo.proveedor || ""

        }
      );

      // 🔥 LIMPIAR
      setNuevo({
        nombre: "",
        compra: "",
        venta: "",
        stock: "",
        categoria: "",
        marca: "",
        proveedor: ""
      });

      cargar();

    } catch (error) {

      console.error(error);

      alert("❌ Error agregando");

    }
  };

  // 🔍 FILTRAR
  const filtrados = lista.filter((p) =>
    (p.nombre || "")
      .toLowerCase()
      .includes(
        busqueda.toLowerCase()
      )
  );

  return (
    <div className="inventario-container">

      <h1>📦 INVENTARIO PRO MAX</h1>

      {/* BUSCAR */}
      <input
        className="buscar"
        placeholder="Buscar producto..."
        value={busqueda}
        onChange={(e) =>
          setBusqueda(e.target.value)
        }
      />

      {/* ENCABEZADOS */}
      <div className="row headers">

        <div>Código</div>

        <div>Nombre</div>

        <div>Compra</div>

        <div>Venta</div>

        <div>Stock</div>

        <div>Categoría</div>

        <div>Marca</div>

        <div>Proveedor</div>

        <div></div>
        <div></div>
        <div></div>

      </div>

      {/* NUEVO PRODUCTO */}
      <div className="row inv-header">

        <input
          value="AUTO"
          disabled
          className="codigo"
        />

        <input
          placeholder="Nombre"
          value={nuevo.nombre}
          onChange={(e)=>
            setNuevo({
              ...nuevo,
              nombre:e.target.value
            })
          }
        />

        <input
          placeholder="Compra"
          value={nuevo.compra}
          onChange={(e)=>
            setNuevo({
              ...nuevo,
              compra:e.target.value
            })
          }
        />

        <input
          placeholder="Venta"
          value={nuevo.venta}
          onChange={(e)=>
            setNuevo({
              ...nuevo,
              venta:e.target.value
            })
          }
        />

        <input
          placeholder="Stock"
          value={nuevo.stock}
          onChange={(e)=>
            setNuevo({
              ...nuevo,
              stock:e.target.value
            })
          }
        />

        <input
          placeholder="Categoría"
          value={nuevo.categoria}
          onChange={(e)=>
            setNuevo({
              ...nuevo,
              categoria:e.target.value
            })
          }
        />

        <input
          placeholder="Marca"
          value={nuevo.marca}
          onChange={(e)=>
            setNuevo({
              ...nuevo,
              marca:e.target.value
            })
          }
        />

        <input
          placeholder="Proveedor"
          value={nuevo.proveedor}
          onChange={(e)=>
            setNuevo({
              ...nuevo,
              proveedor:e.target.value
            })
          }
        />

        {/* STOCK BAJO */}
        <div></div>

        {/* AGREGAR */}
        <button
          className="btn-add"
          onClick={agregar}
        >
          ➕
        </button>

        <div></div>

      </div>

      {/* LISTA */}
      {filtrados.slice(0, 300).map((p) => (

        <div
          key={p.id}
          className="row"
        >

          {/* CÓDIGO */}
          <input
            value={p.codigo || ""}
            disabled
            className="codigo"
          />

          {/* NOMBRE */}
          <input
            value={p.nombre || ""}
            onChange={(e)=>
              cambiarLocal(
                p.id,
                "nombre",
                e.target.value
              )
            }
          />

          {/* COMPRA */}
          <input
            value={p.compra || ""}
            onChange={(e)=>
              cambiarLocal(
                p.id,
                "compra",
                e.target.value
              )
            }
          />

          {/* VENTA */}
          <input
            value={p.venta || ""}
            onChange={(e)=>
              cambiarLocal(
                p.id,
                "venta",
                e.target.value
              )
            }
          />

          {/* STOCK */}
          <input
            value={p.stock || ""}
            onChange={(e)=>
              cambiarLocal(
                p.id,
                "stock",
                e.target.value
              )
            }
          />

          {/* CATEGORÍA */}
          <input
            value={p.categoria || ""}
            onChange={(e)=>
              cambiarLocal(
                p.id,
                "categoria",
                e.target.value
              )
            }
          />

          {/* MARCA */}
          <input
            value={p.marca || ""}
            onChange={(e)=>
              cambiarLocal(
                p.id,
                "marca",
                e.target.value
              )
            }
          />

          {/* PROVEEDOR */}
          <input
            value={p.proveedor || ""}
            onChange={(e)=>
              cambiarLocal(
                p.id,
                "proveedor",
                e.target.value
              )
            }
          />

          {/* STOCK BAJO */}
          <div className="stock-bajo">
            {Number(p.stock) <= 5 ? "⚠" : ""}
          </div>

          {/* GUARDAR */}
          <button
            className="btn-save"
            onClick={() => guardar(p)}
          >
            💾
          </button>

          {/* ELIMINAR */}
          <button
            className="btn-delete"
            onClick={() =>
              eliminar(
                p.id,
                p.nombre
              )
            }
          >
            🗑
          </button>

        </div>

      ))}

    </div>
  );
}
