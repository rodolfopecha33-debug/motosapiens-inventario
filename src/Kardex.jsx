import React, {

  useEffect,

  useMemo,

  useState

} from "react";

import { db } from "./firebase";

import {

  collection,

  getDocs

} from "firebase/firestore";

import * as XLSX from "xlsx";

export default function Kardex() {

  const [mov, setMov] =
    useState([]);

  const [busqueda,
    setBusqueda] =
      useState("");

  // 🚀 ORDEN
  const [ordenCampo,
    setOrdenCampo] =
      useState("fecha");

  const [ordenDireccion,
    setOrdenDireccion] =
      useState("desc");

  // 🚀 LOAD
  useEffect(() => {

    cargar();

  }, []);

  // 🚀 CARGAR
  const cargar = async () => {

    try {

      const snap =
        await getDocs(

          collection(
            db,
            "movimientos"
          )

        );

      const datos = [];

      snap.forEach((d) => {

        datos.push({

          id: d.id,

          ...d.data()

        });

      });

      setMov(datos);

    } catch (error) {

      console.error(error);

      alert(
        "Error cargando kardex"
      );

    }
  };

  // 🚀 FECHA SEGURA
  const parseFecha = (f) => {

    if (
      typeof f === "number"
    ) {

      return new Date(f);

    }

    return new Date();
  };

  // 🚀 ORDENAR
  const ordenarPor = (campo) => {

    if (ordenCampo === campo) {

      setOrdenDireccion(

        ordenDireccion === "asc"

          ? "desc"

          : "asc"

      );

    } else {

      setOrdenCampo(campo);

      setOrdenDireccion("asc");

    }
  };

  // 🚀 FILTRO + ORDEN
  const filtrados =
    useMemo(() => {

      let datos =
        mov.filter((m) => {

          const texto =

            `${m.producto || ""}

             ${m.tipo || ""}

             ${m.usuario || ""}`

              .toLowerCase();

          return texto.includes(

            busqueda.toLowerCase()

          );
        });

      // 🚀 ORDENAMIENTO
      datos.sort((a, b) => {

        let valA =
          a[ordenCampo];

        let valB =
          b[ordenCampo];

        // 🔥 FECHA
        if (
          ordenCampo === "fecha"
        ) {

          valA =
            parseFecha(
              a.fecha
            ).getTime();

          valB =
            parseFecha(
              b.fecha
            ).getTime();
        }

        // 🔥 STRING
        if (
          typeof valA ===
          "string"
        ) {

          valA =
            valA.toLowerCase();
        }

        if (
          typeof valB ===
          "string"
        ) {

          valB =
            valB.toLowerCase();
        }

        // 🔥 ASC
        if (
          ordenDireccion ===
          "asc"
        ) {

          return valA > valB
            ? 1
            : -1;
        }

        // 🔥 DESC
        return valA < valB
          ? 1
          : -1;

      });

      return datos;

    }, [

      mov,

      busqueda,

      ordenCampo,

      ordenDireccion

    ]);

  // 🚀 EXPORTAR EXCEL
  const exportarExcel = () => {

    const datos =
      filtrados.map((m) => ({

        Fecha:
          parseFecha(
            m.fecha
          ).toLocaleString(),

        Producto:
          m.producto || "",

        Tipo:
          m.tipo || "",

        Cantidad:
          m.cantidad || 0,

        Usuario:
          m.usuario || "Sistema",

        "Stock Final":
          m.stockFinal || 0

      }));

    const ws =
      XLSX.utils
        .json_to_sheet(
          datos
        );

    const wb =
      XLSX.utils
        .book_new();

    XLSX.utils
      .book_append_sheet(

        wb,

        ws,

        "Kardex"

      );

    XLSX.writeFile(

      wb,

      `Kardex-${Date.now()}.xlsx`

    );
  };

  // 🎨 COLOR TIPO
  const colorTipo = (tipo) => {

    switch (
      String(tipo)
        .toLowerCase()
    ) {

      case "venta":

        return "#ff4444";

      case "entrada":

        return "#16b84e";

      case "garantia":

        return "#ff9800";

      case "devolucion":

        return "#1e90ff";

      default:

        return "#999";
    }
  };

  return (

    <div className="kardex-container">

      <h1>
        📊 KARDEX PRO MAX
      </h1>

      {/* TOP */}
      <div
        className="kardex-top"
      >

        {/* BUSCAR */}
        <input

          className=
          "buscar-kardex"

          placeholder=
          "Buscar producto, usuario, tipo..."

          value={busqueda}

          onChange={(e)=>

            setBusqueda(
              e.target.value
            )

          }
        />

        {/* EXCEL */}
        <button

          onClick={
            exportarExcel
          }

          className=
          "btn-excel"

        >
          📥 Exportar Excel
        </button>

      </div>

      {/* HEADERS */}
      <div
        className=
        "kardex-row kardex-header"
      >

        <div
          onClick={() =>
            ordenarPor(
              "fecha"
            )
          }
        >
          Fecha
        </div>

        <div
          onClick={() =>
            ordenarPor(
              "producto"
            )
          }
        >
          Producto
        </div>

        <div
          onClick={() =>
            ordenarPor(
              "tipo"
            )
          }
        >
          Tipo
        </div>

        <div
          onClick={() =>
            ordenarPor(
              "cantidad"
            )
          }
        >
          Cantidad
        </div>

        <div
          onClick={() =>
            ordenarPor(
              "usuario"
            )
          }
        >
          Usuario
        </div>

        <div
          onClick={() =>
            ordenarPor(
              "stockFinal"
            )
          }
        >
          Stock Final
        </div>

      </div>

      {/* MOVIMIENTOS */}
      {filtrados.map((m) => (

        <div

          key={m.id}

          className=
          "kardex-row"

        >

          {/* FECHA */}
          <div>

            {parseFecha(
              m.fecha
            ).toLocaleString()}

          </div>

          {/* PRODUCTO */}
          <div>

            {m.producto || "-"}

          </div>

          {/* TIPO */}
          <div>

            <span

              className=
              "tipo-badge"

              style={{

                background:
                  colorTipo(
                    m.tipo
                  )

              }}

            >

              {m.tipo}

            </span>

          </div>

          {/* CANTIDAD */}
          <div
            style={{

              color:

                Number(m.cantidad) > 0

                  ? "#16b84e"

                  : "#ff4444",

              fontWeight:
                "bold"

            }}
          >

            {Number(m.cantidad) > 0

              ? "+"

              : ""}

            {m.cantidad}

          </div>

          {/* USUARIO */}
          <div>

            {m.usuario ||
              "Sistema"}

          </div>

          {/* STOCK */}
          <div>

            {m.stockFinal ?? "-"}

          </div>

        </div>

      ))}

    </div>

  );
}
