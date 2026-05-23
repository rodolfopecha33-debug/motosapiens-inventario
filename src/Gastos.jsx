import React, {
  useEffect,
  useState
} from "react";

import { db } from "./firebase";

import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc
} from "firebase/firestore";

export default function Gastos() {

  const [gastos, setGastos] =
    useState([]);

  const [nuevo, setNuevo] =
    useState({

      tipo: "",
      valor: "",
      detalle: ""

    });

  useEffect(() => {

    cargarGastos();

  }, []);

  const cargarGastos =
    async () => {

      try {

        const snap =
          await getDocs(
            collection(
              db,
              "gastos"
            )
          );

        const datos = [];

        snap.forEach((docu) => {

          datos.push({

            id: docu.id,
            ...docu.data()

          });

        });

        datos.sort(
          (a, b)=>

            b.fecha -
            a.fecha
        );

        setGastos(datos);

      } catch (error) {

        console.error(error);

      }

    };

  const guardarGasto =
    async () => {

      if (
        !nuevo.tipo ||
        !nuevo.valor
      ) {

        alert(
          "Tipo y valor son obligatorios"
        );

        return;

      }

      try {

        await addDoc(

          collection(
            db,
            "gastos"
          ),

          {

            tipo:
              nuevo.tipo,

            valor:
              Number(
                nuevo.valor
              ),

            detalle:
              nuevo.detalle,

            fecha:
              Date.now()

          }

        );

        setNuevo({

          tipo: "",
          valor: "",
          detalle: ""

        });

        cargarGastos();

      } catch (error) {

        console.error(error);

      }

    };

  const eliminarGasto =
    async (id) => {

      const confirmar =
        window.confirm(
          "Eliminar gasto?"
        );

      if (!confirmar)
        return;

      try {

        await deleteDoc(
          doc(
            db,
            "gastos",
            id
          )
        );

        cargarGastos();

      } catch (error) {

        console.error(error);

      }

    };

  const totalGastos =
    gastos.reduce(

      (sum, g)=>

        sum +
        Number(
          g.valor || 0
        ),

      0

    );

  return (

    <div
      style={{
        padding: 25,
        color: "white"
      }}
    >

      <h1>
        💸 Gastos
      </h1>

      <div
        style={{

          background: "#111",

          padding: 20,

          borderRadius: 16,

          marginTop: 20,

          border:
            "1px solid #222"

        }}
      >

        <h2>
          Registrar gasto
        </h2>

        <div
          style={{

            display: "flex",

            gap: 10,

            flexWrap: "wrap",

            marginTop: 15

          }}
        >

          <select

            value={nuevo.tipo}

            onChange={(e)=>

              setNuevo({

                ...nuevo,

                tipo:
                  e.target.value

              })

            }

            style={inputStyle()}

          >

            <option value="">
              Tipo gasto
            </option>

            <option>
              Arriendo
            </option>

            <option>
              Nómina
            </option>

            <option>
              Servicios
            </option>

            <option>
              Transporte
            </option>

            <option>
              Papelería
            </option>

            <option>
              Mensajería
            </option>

            <option>
              Herramientas
            </option>

            <option>
              Otros
            </option>

          </select>

          <input

            type="number"

            placeholder="Valor"

            value={nuevo.valor}

            onChange={(e)=>

              setNuevo({

                ...nuevo,

                valor:
                  e.target.value

              })

            }

            style={inputStyle()}

          />

          <input

            placeholder="Detalle"

            value={nuevo.detalle}

            onChange={(e)=>

              setNuevo({

                ...nuevo,

                detalle:
                  e.target.value

              })

            }

            style={inputStyle()}

          />

          <button

            style={buttonStyle()}

            onClick={
              guardarGasto
            }

          >

            Guardar

          </button>

        </div>

      </div>

      <div
        style={{

          marginTop: 25,

          background: "#111",

          padding: 20,

          borderRadius: 16,

          border:
            "1px solid #222"

        }}
      >

        <h2>
          📊 Total gastos
        </h2>

        <h1>
          $

          {
            totalGastos
              .toLocaleString()
          }
        </h1>

      </div>

      <div
        style={{

          marginTop: 25,

          background: "#111",

          padding: 20,

          borderRadius: 16,

          border:
            "1px solid #222"

        }}
      >

        <h2>
          📋 Historial
        </h2>

        <div
          style={{
            overflowX: "auto"
          }}
        >

          <table
            style={{

              width: "100%",

              borderCollapse:
                "collapse"

            }}
          >

            <thead>

              <tr>

                <th style={th()}>
                  Fecha
                </th>

                <th style={th()}>
                  Tipo
                </th>

                <th style={th()}>
                  Valor
                </th>

                <th style={th()}>
                  Detalle
                </th>

                <th style={th()}>
                  Acción
                </th>

              </tr>

            </thead>

            <tbody>

              {

                gastos.map((g)=>(

                  <tr
                    key={g.id}
                  >

                    <td style={td()}>

                      {

                        new Date(
                          g.fecha
                        )

                        .toLocaleDateString(
                          "es-CO"
                        )

                      }

                    </td>

                    <td style={td()}>
                      {g.tipo}
                    </td>

                    <td style={td()}>

                      $

                      {

                        Number(
                          g.valor || 0
                        )

                        .toLocaleString()

                      }

                    </td>

                    <td style={td()}>
                      {g.detalle}
                    </td>

                    <td style={td()}>

                      <button

                        onClick={()=>

                          eliminarGasto(
                            g.id
                          )

                        }

                        style={{

                          background:
                            "#e53935",

                          border:
                            "none",

                          color:
                            "white",

                          padding:
                            "8px 12px",

                          borderRadius:
                            8,

                          cursor:
                            "pointer"

                        }}

                      >

                        Eliminar

                      </button>

                    </td>

                  </tr>

                ))

              }

            </tbody>

          </table>

        </div>

      </div>

    </div>

  );

}

function inputStyle() {

  return {

    background: "#222",

    border:
      "1px solid #333",

    borderRadius: 10,

    color: "white",

    padding: "10px 14px",

    minWidth: 180

  };

}

function buttonStyle() {

  return {

    background: "#16b84e",

    color: "white",

    border: "none",

    padding: "10px 16px",

    borderRadius: 8,

    cursor: "pointer"

  };

}

function th() {

  return {

    padding: 12,

    borderBottom:
      "1px solid #333",

    textAlign: "left"

  };

}

function td() {

  return {

    padding: 12,

    borderBottom:
      "1px solid #222"

  };

}
