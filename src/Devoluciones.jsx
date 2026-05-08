import React, {
  useEffect,
  useState
} from "react";

import {
  collection,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  getDoc,
  serverTimestamp
} from "firebase/firestore";

import { db } from "./firebase";

import {
  crearMovimiento
} from "./kardexUtils";

export default function Devoluciones({ user }) {

  const [productos,
    setProductos] =
      useState([]);

  const [productoId,
    setProductoId] =
      useState("");

  const [cantidad,
    setCantidad] =
      useState(1);

  const [motivo,
    setMotivo] =
      useState("garantia");

  const [detalle,
    setDetalle] =
      useState("");

  // 🔥 CARGAR
  useEffect(() => {

    cargarProductos();

  }, []);

  const cargarProductos =
    async () => {

      const snap =
        await getDocs(

          collection(
            db,
            "inventario"
          )

        );

      const datos = [];

      snap.forEach((d) => {

        datos.push({

          id: d.id,

          ...d.data()

        });

      });

      setProductos(datos);
    };

  // 🚀 GUARDAR
  const guardar =
    async () => {

      try {

        const producto =
          productos.find(

            (p) =>
              p.id === productoId

          );

        if (!producto) {

          alert(
            "Producto inválido"
          );

          return;
        }

        // 🔥 GARANTIA
        const reintegraStock =

          motivo ===
          "insatisfaccion";

        let nuevoStock =
          Number(
            producto.stock || 0
          );

        // ✅ DEVOLUCIÓN NORMAL
        if (reintegraStock) {

          nuevoStock +=
            Number(cantidad);

          // 🔥 UPDATE STOCK
          await updateDoc(

            doc(
              db,
              "inventario",
              producto.id
            ),

            {

              stock:
                nuevoStock

            }

          );
        }

        // 🔥 GUARDAR DEVOLUCIÓN
        await addDoc(

          collection(
            db,
            "devoluciones"
          ),

          {

            productoId:
              producto.id,

            producto:
              producto.nombre,

            cantidad:
              Number(cantidad),

            motivo,

            detalle,

            usuario:
              user || "Sistema",

            reintegraStock,

            fecha:
              serverTimestamp()

          }

        );

        // 🔥 KARDEX
        await crearMovimiento({

          producto:
            producto.nombre,

          productoId:
            producto.id,

          tipo:

            motivo ===
            "garantia"

              ? "GARANTIA"

              : "DEVOLUCION",

          cantidad:
            Number(cantidad),

          stockFinal:
            nuevoStock,

          usuario:
            user || "Sistema"

        });

        alert(
          "Devolución registrada"
        );

        setCantidad(1);

        setDetalle("");

      } catch (error) {

        console.log(error);

        alert(
          "Error guardando devolución"
        );

      }
    };

  return (

    <div className="devoluciones-container">

      <h1>
        🔄 Devoluciones
      </h1>

      {/* PRODUCTO */}
      <select
        value={productoId}
        onChange={(e)=>

          setProductoId(
            e.target.value
          )

        }
      >

        <option value="">
          Seleccione producto
        </option>

        {productos.map((p)=>(

          <option
            key={p.id}
            value={p.id}
          >

            {p.nombre}

          </option>

        ))}

      </select>

      {/* CANTIDAD */}
      <input
        type="number"
        placeholder="Cantidad"
        value={cantidad}
        onChange={(e)=>

          setCantidad(
            e.target.value
          )

        }
      />

      {/* MOTIVO */}
      <select
        value={motivo}
        onChange={(e)=>

          setMotivo(
            e.target.value
          )

        }
      >

        <option value="garantia">
          Garantía
        </option>

        <option value="insatisfaccion">
          Insatisfacción Cliente
        </option>

      </select>

      {/* DETALLE */}
      <textarea
        placeholder="Detalle..."
        value={detalle}
        onChange={(e)=>

          setDetalle(
            e.target.value
          )

        }
      />

      {/* BTN */}
      <button
        onClick={guardar}
      >

        Guardar devolución

      </button>

    </div>

  );
}
