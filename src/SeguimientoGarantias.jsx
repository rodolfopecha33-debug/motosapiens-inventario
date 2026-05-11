import React, {
  useEffect,
  useState
} from "react";

import {
  collection,
  getDocs,
  doc,
  updateDoc
} from "firebase/firestore";

import { db } from "./firebase";

export default function SeguimientoGarantias() {

  const [garantias,
    setGarantias] =
      useState([]);

  // 🚀 CARGAR
  useEffect(() => {

    cargarGarantias();

  }, []);

  const cargarGarantias =
    async () => {

      try {

        const snap =
          await getDocs(

            collection(
              db,
              "devoluciones"
            )

          );

        const datos = [];

        snap.forEach((d) => {

          const data =
            d.data();

          // 🔥 SOLO GARANTIAS
          if (
            data.motivo ===
            "garantia"
          ) {

            datos.push({

              id: d.id,

              ...data

            });

          }

        });

        setGarantias(datos);

      } catch (error) {

        console.log(error);

      }
    };

  // 🚀 CAMBIAR ESTADO
  const cambiarEstado =
    async (
      id,
      estado
    ) => {

      try {

        await updateDoc(

          doc(
            db,
            "devoluciones",
            id
          ),

          {
            estado
          }

        );

        // 🔥 REFRESH
        cargarGarantias();

      } catch (error) {

        console.log(error);

      }
    };

  // 🎨 COLOR
  const colorEstado =
    (estado) => {

      switch (estado) {

        case "pendiente":
          return "#ff9800";

        case "enviada":
          return "#2196f3";

        case "aprobada":
          return "#00c853";

        case "rechazada":
          return "#ff4444";

        case "entregada":
          return "#9c27b0";

        default:
          return "#999";
      }
    };

  return (

    <div
      className="
      devoluciones-container
    ">

      <h1
        className="
        devoluciones-title
      ">
        🛡 Seguimiento Garantías
      </h1>

      <div
        className="
        resultados-productos
      ">

        {garantias.map((g) => (

          <div

            key={g.id}

            className="
            producto-dev
          "

            style={{
              marginBottom: 20
            }}
          >

            <div
              style={{
                width: "100%"
              }}
            >

              {/* PRODUCTO */}
              <h3>

                {g.producto}

              </h3>

              {/* CLIENTE */}
              <p>

                👤 Cliente:
                {g.cliente || "-"}

              </p>

              {/* TEL */}
              <p>

                📞 Tel:
                {g.telefono || "-"}

              </p>

              <p>

  📅 {

    g.fecha?.toDate
      ? g.fecha
          .toDate()
          .toLocaleString()
      : "-"

  }

</p>

              {/* DETALLE */}
              <p>

                📝 {g.detalle}

              </p>


              {/* IMAGENES */}
<div
  style={{

    display: "flex",

    gap: 10,

    flexWrap: "wrap",

    marginTop: 15

  }}
>

  {g.imagenes?.map(
    (img, i) => (

      <img

        key={i}

        src={img}

        alt="garantia"

        style={{

          width: 120,

          height: 120,

          objectFit: "cover",

          borderRadius: 12,

          border:
            "2px solid #222"

        }}

      />

    )
  )}

</div>

              {/* ESTADO */}
              <div
                style={{
                  marginTop: 10
                }}
              >

                <span

                  style={{

                    background:
                      colorEstado(
                        g.estado
                      ),

                    padding:
                      "8px 15px",

                    borderRadius: 20,

                    fontWeight:
                      "bold"

                  }}
                >

                  {g.estado?.toUpperCase()}

                </span>

              </div>

              {/* BOTONES */}
              <div
                style={{

                  display: "flex",

                  gap: 10,

                  marginTop: 15,

                  flexWrap: "wrap"

                }}
              >

                <button
                  className="
                  btn-devolucion
                "
                  onClick={() =>

                    cambiarEstado(
                      g.id,
                      "enviada"
                    )

                  }
                >

                  📦 Enviada

                </button>

                <button
                  className="
                  btn-devolucion
                "
                  onClick={() =>

                    cambiarEstado(
                      g.id,
                      "aprobada"
                    )

                  }
                >

                  ✅ Aprobada

                </button>

                <button
                  className="
                  btn-devolucion
                "
                  onClick={() =>

                    cambiarEstado(
                      g.id,
                      "rechazada"
                    )

                  }
                >

                  ❌ Rechazada

                </button>

                <button
                  className="
                  btn-devolucion
                "
                  onClick={() =>

                    cambiarEstado(
                      g.id,
                      "entregada"
                    )

                  }
                >

                  🚚 Entregada

                </button>

              </div>

            </div>

          </div>

        ))}

      </div>

    </div>

  );
}
