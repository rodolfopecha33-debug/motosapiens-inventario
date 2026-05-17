import React, {
  useEffect,
  useState
} from "react";

import { db } from "./firebase";

import * as XLSX
  from "xlsx";


import { resetVentas } from "./resetDB";

import {
  collection,
  getDocs
} from "firebase/firestore";

import {

  ResponsiveContainer,

  LineChart,
  Line,

  PieChart,
  Pie,

  Cell,

  CartesianGrid,

  XAxis,
  YAxis,

  Tooltip,

  Legend

} from "recharts";

// 🔥 COLORES
const COLORS = [

  "#00ff88",

  "#a855f7",

  "#ff4444",

  "#3b82f6"

];

// 🔥 FECHA SEGURA
const parseFecha = (f) => {

  try {

    // 🔥 NUMBER
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

    // 🔥 STRING COLOMBIA
    if (
      typeof f === "string"
    ) {

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

          .trim();

      const partes =
        limpia.split(",");

      if (
        partes.length < 2
      ) {

        return null;

      }

      const fechaPart =
        partes[0].trim();

      const horaPart =
        partes[1].trim();

      const [

        dia,

        mes,

        anio

      ] =
        fechaPart.split("/");

      const horaSplit =
        horaPart.split(":");

      let hora =
        Number(
          horaSplit[0]
        );

      const minutos =
        Number(
          horaSplit[1]
        );

      const segundos =
        Number(
          horaSplit[2]
            .slice(0,2)
        );

      const ampm =
        horaSplit[2]
          .slice(2)
          .trim();

      if (
        ampm === "PM" &&
        hora !== 12
      ) {

        hora += 12;

      }

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

        minutos,

        segundos

      );
    }

    return null;

  } catch {

    return null;

  }

};

export default function Dashboard() {

  const [ventas, setVentas] =
    useState([]);

  const [fechaInicio, setFechaInicio] =
  useState("");

const [fechaFin, setFechaFin] =
  useState("");

  const [filtro, setFiltro] =
    useState("mes");

  // 🔥 LOAD
  useEffect(() => {

    cargarVentas();

  }, []);

  // 🔥 CARGAR



const cargarVentas = async () => {

  try {

    console.log("🔥 Cargando ventas Firebase...");

    const snap = await getDocs(
      collection(db, "ventas")
    );

    console.log(
      "TOTAL FIREBASE:",
      snap.size
    );

    const datos = [];

    snap.forEach((docu) => {

      const venta = {

        id: docu.id,

        ...docu.data()

      };

      console.log(
        "VENTA:",
        venta
      );

      datos.push(venta);

    });

    setVentas(datos);

  } catch (error) {

    console.error(error);

  }
};

  

  // 🔥 FILTRAR
  const ventasFiltradas =
  ventas.filter((v) => {

    if (!v.fecha) return false;

   

     const fecha =
  parseFecha(v.fecha);

    if (!fecha)
  return false;
    
    const ahora =
      new Date();

    // 🔥 RANGO PERSONALIZADO
    if (
      fechaInicio &&
      fechaFin
    ) {

      const inicio =
        new Date(fechaInicio);

      const fin =
        new Date(fechaFin);

      // 🔥 FIN DEL DÍA
      fin.setHours(
        23,
        59,
        59,
        999
      );

      return (
        fecha >= inicio &&
        fecha <= fin
      );
    }

    // 🔥 HOY
    if (filtro === "hoy") {

      return (

        fecha.toDateString() ===
        ahora.toDateString()

      );
    }

    // 🔥 SEMANA
    if (filtro === "semana") {

      const hace7 =
        new Date();

      hace7.setDate(
        ahora.getDate() - 7
      );

      return fecha >= hace7;
    }

    // 🔥 MES
    if (filtro === "mes") {

      return (

        fecha.getMonth() ===
        ahora.getMonth() &&

        fecha.getFullYear() ===
        ahora.getFullYear()

      );
    }

    // 🔥 AÑO
    if (filtro === "año") {

      return (

        fecha.getFullYear() ===
        ahora.getFullYear()

      );
    }

    return true;

  });


  const ventasOrdenadas =

  [...ventasFiltradas]

    .sort(

      (a, b)=>

        parseFecha(
          b.fecha
        ) -

        parseFecha(
          a.fecha
        )

    );
  

  // 🔥 KPIS
  const totalVentas =
    ventasFiltradas.reduce(

      (sum, v) =>

        sum +
        Number(v.total || 0),

      0

    );

  const totalItems =
    ventasFiltradas.reduce(

      (sum, v) =>

        sum +

        (v.productos || [])
          .reduce(

            (a, p) =>

              a +
              Number(
                p.cantidad || 0
              ),

            0

          ),

      0

    );

  const totalGanancia =
    ventasFiltradas.reduce(

      (sum, venta) =>

        sum +

        (venta.productos || [])
          .reduce(

            (g, p) =>

              g +

              (

                Number(
                  p.venta || 0
                ) -

                Number(
                  p.compra || 0
                )

              ) *

              Number(
                p.cantidad || 0
              ),

            0

          ),

      0

    );

  const ticketPromedio =

    ventasFiltradas.length > 0

      ? Math.round(

          totalVentas /

          ventasFiltradas.length

        )

      : 0;

  // 🔥 VENTAS POR DÍA
  const ventasPorDia = [];

  const mapaDias = {};

  ventasFiltradas.forEach((v) => {

   const fecha =
  parseFecha(v.fecha)
    ?.toLocaleDateString(
      "es-CO"
    );

    mapaDias[fecha] =

      (mapaDias[fecha] || 0)

      + Number(v.total || 0);

  });

  Object.keys(mapaDias)
    .forEach((f) => {

      ventasPorDia.push({

        fecha: f,

        ventas:
          mapaDias[f]

      });

    });

  // 🔥 MÉTODOS PAGO
  const metodosPago = [];

  const mapaPago = {};

  ventasFiltradas.forEach((v) => {

    const metodo =
      v.metodoPago ||
      "otro";

    mapaPago[metodo] =

      (mapaPago[metodo] || 0)

      + Number(v.total || 0);

  });

  Object.keys(mapaPago)
    .forEach((m) => {

      metodosPago.push({

        metodo: m,

        valor:
          mapaPago[m]

      });

    });

  // 🔥 TOP PRODUCTOS
  const mapaProductos = {};

  ventasFiltradas.forEach((v) => {

    (v.productos || [])
      .forEach((p) => {

        mapaProductos[
          p.nombre
        ] =

          (mapaProductos[
            p.nombre
          ] || 0)

          + Number(
            p.cantidad || 0
          );

      });

  });

  const topProductos =

    Object.keys(mapaProductos)

      .map((k) => ({

        producto: k,

        cantidad:
          mapaProductos[k]

      }))

      .sort(
        (a, b) =>

          b.cantidad -
          a.cantidad

      )

      .slice(0, 5);

  // 🔥 EXPORTAR CSV
  const exportarExcel =
  () => {

    const datos =

      ventasOrdenadas.map(
        (v) => ({

          Fecha:

            parseFecha(v.fecha)
              ?.toLocaleString(
                "es-CO"
              ),

          Usuario:
            v.usuario,

          Productos:

            (v.productos || [])

              .map(
                (p) =>
                  p.nombre
              )

              .join(" | "),

          Items:

            (v.productos || [])
              .reduce(

                (a, p)=>

                  a +

                  Number(
                    p.cantidad || 0
                  ),

                0

              ),

          Total:
            Number(
              v.total || 0
            ),

          Metodo:
            v.metodoPago

        }))
;

    // 🔥 CREAR HOJA
    const ws =
      XLSX.utils
        .json_to_sheet(
          datos
        );

    // 🔥 CREAR LIBRO
    const wb =
      XLSX.utils
        .book_new();

    XLSX.utils.book_append_sheet(

      wb,

      ws,

      "Ventas"

    );

    // 🔥 DESCARGAR
    XLSX.writeFile(

      wb,

      "dashboard.xlsx"

    );

  };
  

  return (

    <div
      style={{
        padding: "25px",
        color: "white"
      }}
    >

      <h1>
        📊 Dashboard PRO MAX
      </h1>

      {/* FILTROS */}
      <div className="filtros">

        <button
          onClick={() =>
            setFiltro("hoy")
          }
        >
          Hoy
        </button>

        <button
          onClick={() =>
            setFiltro("semana")
          }
        >
          Semana
        </button>

        <button
          onClick={() =>
            setFiltro("mes")
          }
        >
          Mes
        </button>

        <button
          onClick={() =>
            setFiltro("año")
          }
        >
          Año
        </button>


        

      </div>



      <div className="filtro-fechas">

  <input
    type="date"
    value={fechaInicio}
    onChange={(e) =>
      setFechaInicio(
        e.target.value
      )
    }
  />

  <input
    type="date"
    value={fechaFin}
    onChange={(e) =>
      setFechaFin(
        e.target.value
      )
    }
  />

  <button
    onClick={() => {

      setFechaInicio("");

      setFechaFin("");

    }}
  >
    Limpiar
  </button>

</div>
      

      {/* KPIS */}
      <div className="cards-grid">

        <Card
          titulo="💰 Ventas"
          valor={`$${totalVentas.toLocaleString()}`}
        />

        <Card
          titulo="📈 Ganancia"
          valor={`$${totalGanancia.toLocaleString()}`}
        />

        <Card
          titulo="📦 Items"
          valor={totalItems}
        />

        <Card
          titulo="🧾 Ticket"
          valor={`$${ticketPromedio.toLocaleString()}`}
        />

      </div>

      {/* GRÁFICAS */}
      <div className="chart-card">

        <h3>
          📈 Ventas por Día
        </h3>

        <ResponsiveContainer
          width="100%"
          height={320}
        >

          <LineChart
            data={ventasPorDia}
          >

            <CartesianGrid
              strokeDasharray="3 3"
            />

            <XAxis
              dataKey="fecha"
            />

            <YAxis />

            <Tooltip />

            <Legend />

            <Line
              type="monotone"
              dataKey="ventas"
              stroke="#00ff88"
              strokeWidth={3}
            />

          </LineChart>

        </ResponsiveContainer>

      </div>

      {/* PAGOS */}
      <div className="chart-card">

        <h3>
          💳 Métodos Pago
        </h3>

        <ResponsiveContainer
          width="100%"
          height={320}
        >

          <PieChart>

            <Pie
              data={metodosPago}
              dataKey="valor"
              nameKey="metodo"
              outerRadius={100}
              label
            >

              {metodosPago.map(
                (_, i) => (

                <Cell
                  key={i}
                  fill={
                    COLORS[
                      i %
                      COLORS.length
                    ]
                  }
                />

              ))}

            </Pie>

            <Tooltip />

            <Legend />

          </PieChart>

        </ResponsiveContainer>

      </div>

      {/* TOP */}
      <div className="chart-card">

        <h3>
          🏆 Productos Más Vendidos
        </h3>

        {topProductos.map(
          (p, i) => (

          <div
            key={i}
            className="top-row"
          >

           <div
  key={i}
  className="top-row"
>

  <span

    style={{

      maxWidth: "75%",

      overflow: "hidden",

      textOverflow:
        "ellipsis",

      whiteSpace:
        "nowrap"

    }}

  >

    {p.producto}

  </span>

  <strong>
    {p.cantidad}
  </strong>

</div>
            

            <strong>
              {p.cantidad}
            </strong>

          </div>

        ))}

      </div>

      {/* BOTONES */}
      <div
        style={{
          display: "flex",
          gap: "10px",
          marginTop: "20px"
        }}
      >

        <button
          onClick={exportarExcel}
          style={btn()}
        >
          📥 Exportar Excel
        </button>


      

  
        


        
        <button
          onClick={() => {

  const ok =
    window.confirm(

      "¿Eliminar ventas?"

    );

  if (ok) {

    resetVentas();

  }

}}
          style={btnDanger()}
        >
          🧨 Reset Ventas
        </button>

      </div>

      {/* TABLA */}
      <table
        style={{
          width: "100%",
          marginTop: "25px",
          borderCollapse:
            "collapse",
          background: "#111"
        }}
      >

        <thead>

          <tr>

            <th>Fecha</th>

            <th>Usuario</th>

            <th>Productos</th>

            <th>Items</th>

            <th>Total</th>

            <th>Método</th>

          </tr>

        </thead>

        <tbody>


                  
          {ventasOrdenadas.map(
            (v, i) => (

            <tr key={i}>

            <td>

        {
  parseFecha(v.fecha)
    ?.toLocaleString(
      "es-CO"
    )
}

</td>

              <td>{v.usuario}</td>

              <td>

  {

    v.productos?.[0]
      ?.nombre || "-"

  }

  {

    v.productos
      ?.length > 1

      &&

      ` +${
        v.productos.length - 1
      }`

  }

</td>

<td>

  {

    (v.productos || [])
      .reduce(

        (a, p)=>

          a +

          Number(
            p.cantidad || 0
          ),

        0

      )

  }

</td>
                         
              
              <td>
                $
                {Number(
                  v.total || 0
                ).toLocaleString()}
              </td>

              <td>

                <span
                  className={`pago ${v.metodoPago}`}
                >

                  {v.metodoPago}

                </span>

              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>

  );
}

// 🔥 CARD
function Card({
  titulo,
  valor
}) {

  return (

    <div
      className="card-pro"
    >

      <h3>{titulo}</h3>

      <h2>{valor}</h2>

    </div>

  );
}

// 🔥 BTN
function btn() {

  return {

    background: "#16b84e",

    color: "white",

    border: "none",

    padding: "12px 18px",

    borderRadius: "10px",

    cursor: "pointer"

  };
}

// 🔥 BTN DANGER
function btnDanger() {

  return {

    background: "#ff2a2a",

    color: "white",

    border: "none",

    padding: "12px 18px",

    borderRadius: "10px",

    cursor: "pointer"

  };
}
