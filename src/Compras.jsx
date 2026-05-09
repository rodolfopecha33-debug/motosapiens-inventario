import React, {
  useEffect,
  useState
} from "react";

import { db } from "./firebase";

import {
  collection,
  getDocs,
  addDoc,
  doc,
  updateDoc
} from "firebase/firestore";

export default function Compras() {

  const [lista, setLista] =
    useState([]);

  const [busqueda, setBusqueda] =
    useState("");

  useEffect(() => {

    cargar();

  }, []);

  // 🔥 CARGAR
  const cargar = async () => {

    const snap =
      await getDocs(

        collection(
          db,
          "inventario"
        )

      );

    const datos = [];

    snap.forEach((d) =>

      datos.push({

        id: d.id,

        ...d.data()

      })

    );

    setLista(datos);

  };

  // 🔥 COMPRAR
  const comprar =
    async (p, cantidad) => {

      if (
        !cantidad ||
        cantidad <= 0
      ) {

        alert(
          "Cantidad inválida"
        );

        return;
      }

      const nuevoStock =

        Number(p.stock || 0)

        +

        Number(cantidad);

      // 🔥 UPDATE INVENTARIO
      await updateDoc(

        doc(
          db,
          "inventario",
          p.id
        ),

        {

          stock: nuevoStock,

          compra:
            Number(
              p.compra || 0
            )

        }

      );

      // 🔥 MOVIMIENTO
      await addDoc(

        collection(
          db,
          "movimientos"
        ),

        {

          tipo: "COMPRA",

          producto:
            p.nombre,

          productoId:
            p.codigo || "",

          cantidad:
            Number(cantidad),

          stockFinal:
            nuevoStock,

          metodoPago: "",

          usuario:
            "Rodolfo",

          fecha:
            Date.now()

        }

      );

      alert(
        "Compra registrada"
      );

      cargar();

    };

  // 🔥 FILTRAR
  const filtrados =
    lista.filter((p) =>

      p.nombre

        ?.toLowerCase()

        .includes(

          busqueda.toLowerCase()

        )

    );

  return (

    <div className="compras-container">

      <h1 className="compras-title">
        📦 Compras ERP
      </h1>

      {/* BUSCADOR */}
      <input

        className="compras-search"

        placeholder="Buscar producto..."

        value={busqueda}

        onChange={(e)=>

          setBusqueda(
            e.target.value
          )

        }
      />

      {/* LISTA */}
      <div className="compras-grid">

        {filtrados

          .slice(0,100)

          .map((p)=>(

            <Item

              key={p.id}

              p={p}

              comprar={comprar}

            />

        ))}

      </div>

    </div>

  );

}

// 🔥 ITEM
function Item({
  p,
  comprar
}) {

  const [cant, setCant] =
    useState("");

  return (

    <div className="compra-card">

      {/* TOP */}
      <div className="compra-top">

        <div>

          <h3 className="compra-nombre">

            {p.nombre}

          </h3>

          <p className="compra-ref">

            Ref:
            {p.codigo || "N/A"}

          </p>

        </div>

        <div className="stock-badge">

          Stock:
          {p.stock || 0}

        </div>

      </div>

      {/* BOTTOM */}
      <div className="compra-actions">

        <input

          type="number"

          placeholder="Cantidad"

          className="input-cantidad"

          value={cant}

          onChange={(e)=>

            setCant(
              e.target.value
            )

          }
        />

        <button

          className="btn-comprar"

          onClick={()=>

            comprar(
              p,
              cant
            )

          }
        >

          📦 Comprar

        </button>

      </div>

    </div>

  );

}
