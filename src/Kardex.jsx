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

  try {

    // 🔥 TIMESTAMP NUMBER
    if (
      typeof f === "number"
    ) {

      return new Date(f);

    }

    // 🔥 FIREBASE TIMESTAMP
    if (
      f?.seconds
    ) {

      return new Date(
        f.seconds * 1000
      );

    }

    // 🔥 STRING
    if (
      typeof f === "string"
    ) {

      // 🚀 LIMPIAR FORMATO COLOMBIA
      // Ej:
      // 7/5/2026, 3:58:38 p. m.

      const limpia =
        f

          .replace(
            "p. m.",
            "PM"
          )

          .replace(
            "a. m.",
            "AM"
          )

          .replace(/\s+/g, " ")
          .trim();

      const partes =
        limpia.split(",");

      // 🚨 INVALID
      if (
        partes.length < 2
      ) {

        return null;

      }

      const fechaPart =
        partes[0].trim();

      const horaPart =
        partes[1].trim();

      // 🔥 DD/MM/YYYY
      const [

        dia,

        mes,

        anio

      ] =
        fechaPart.split("/");

      // 🚨 VALIDAR
      if (
        !dia ||
        !mes ||
        !anio
      ) {

        return null;

      }

      // 🔥 HORA
      // 3:58:38 PM

      const horaSplit =
        horaPart.split(":");

      if (
        horaSplit.length < 3
      ) {

        return null;

      }

      let horaTexto =
        horaSplit[0];

      let minutos =
        horaSplit[1];

      let segundosAMPM =
        horaSplit[2];

      let segundos =
        segundosAMPM
          .slice(0, 2);

      let ampm =
        segundosAMPM
          .slice(2)
          .trim();

      let hora =
        Number(horaTexto);

      // 🔥 PM
      if (

        ampm === "PM" &&

        hora !== 12

      ) {

        hora += 12;

      }

      // 🔥 AM
      if (

        ampm === "AM" &&

        hora === 12

      ) {

        hora = 0;

      }

      return new Date(

        Number(anio),

        Number(mes) - 1,

        Number(dia),

        hora,

        Number(minutos),

        Number(segundos)

      );
    }

    return null;

  } catch (error) {

    console.log(error);

    return null;

  }
};

// 🚀 FORMATO PROFESIONAL FECHA
const formatearFecha = (fecha) => {

  const f =
    parseFecha(fecha);

  if (!f) return "-";

  const dia =
    String(f.getDate())
      .padStart(2, "0");

  const mes =
    String(f.getMonth() + 1)
      .padStart(2, "0");

  const anio =
    f.getFullYear();

  const hora =
    f.toLocaleTimeString(
      "es-CO",
      {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
      }
    );

  return `${dia}/${mes}/${anio} - ${hora}`;
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
            )?.getTime() || 0;

          valB =
            parseFecha(
              b.fecha
            )?.getTime() || 0;
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
          formatearFecha(
            m.fecha
          ),

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
          style={{
            cursor: "pointer"
          }}
        >
          Fecha
        </div>

        <div
          onClick={() =>
            ordenarPor(
              "producto"
            )
          }
          style={{
            cursor: "pointer"
          }}
        >
          Producto
        </div>

        <div
          onClick={() =>
            ordenarPor(
              "tipo"
            )
          }
          style={{
            cursor: "pointer"
          }}
        >
          Tipo
        </div>

        <div
          onClick={() =>
            ordenarPor(
              "cantidad"
            )
          }
          style={{
            cursor: "pointer"
          }}
        >
          Cantidad
        </div>

        <div
          onClick={() =>
            ordenarPor(
              "usuario"
            )
          }
          style={{
            cursor: "pointer"
          }}
        >
          Usuario
        </div>

        <div
          onClick={() =>
            ordenarPor(
              "stockFinal"
            )
          }
          style={{
            cursor: "pointer"
          }}
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

            {formatearFecha(
              m.fecha
            )}

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
