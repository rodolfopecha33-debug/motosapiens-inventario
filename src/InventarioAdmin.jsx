import React, {
  useEffect,
  useState,
  useMemo
} from "react";

import { db } from "./firebase";

import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  addDoc
} from "firebase/firestore";

import * as XLSX from "xlsx";

export default function InventarioAdmin() {

  const [lista, setLista] =
    useState([]);

  const [busqueda, setBusqueda] =
    useState("");

  // 🔥 ORDENAMIENTO
  const [ordenCampo, setOrdenCampo] =
    useState("nombre");

  const [ordenDireccion,
    setOrdenDireccion] =
      useState("asc");

  // 🔥 NUEVO PRODUCTO
  const [nuevo, setNuevo] =
    useState({

      nombre: "",

      compra: "",

      venta: "",

      stock: "",

      categoria: "",

      marca: "",

      proveedor: ""

    });

  // 🔥 LOAD
  useEffect(() => {

    cargar();

  }, []);

  // 🔥 CARGAR INVENTARIO
  const cargar = async () => {

    try {

      const snap = await getDocs(

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

      setLista(datos);

    } catch (error) {

      console.error(error);

      alert(
        "Error cargando inventario"
      );

    }
  };

  // 🔥 ORDENAR
  const ordenarPor = (campo) => {

    if (ordenCampo === campo) {

      setOrdenDireccion((prev) =>

        prev === "asc"
          ? "desc"
          : "asc"

      );

    } else {

      setOrdenCampo(campo);

      setOrdenDireccion("asc");

    }
  };

  // 🔥 CAMBIOS LOCALES
  const cambiarLocal = (
    id,
    campo,
    valor
  ) => {

    setLista((prev) =>

      prev.map((p) =>

        p.id === id

          ? {

              ...p,

              [campo]: valor

            }

          : p

      )

    );
  };

  // 🔥 GUARDAR
  const guardar = async (p) => {

    try {

      await updateDoc(

        doc(
          db,
          "inventario",
          p.id
        ),

        {

          nombre:
            p.nombre || "",

          compra:
            Number(
              p.compra || 0
            ),

          venta:
            Number(
              p.venta || 0
            ),

          stock:
            Number(
              p.stock || 0
            ),

          categoria:
            p.categoria || "",

          marca:
            p.marca || "",

          proveedor:
            p.proveedor || ""

        }

      );

      alert(
        "✅ Guardado"
      );

    } catch (error) {

      console.error(error);

      alert(
        "❌ Error guardando"
      );

    }
  };

  // 🔥 ELIMINAR
  const eliminar = async (
    id,
    nombre
  ) => {

    const ok = window.confirm(

      `⚠️ ¿Eliminar producto?\n\n${nombre}`

    );

    if (!ok) return;

    try {

      await deleteDoc(

        doc(
          db,
          "inventario",
          id
        )

      );

      setLista(

        lista.filter(
          (p) => p.id !== id
        )

      );

      alert(
        "✅ Eliminado"
      );

    } catch (error) {

      console.error(error);

      alert(
        "❌ Error eliminando"
      );

    }
  };

  // 🔥 AGREGAR PRODUCTO
  const agregar = async () => {

    if (!nuevo.nombre) {

      return alert(
        "Falta nombre"
      );

    }

    try {

      // 🔥 CÓDIGO AUTOMÁTICO
      let ultimo = 100000;

      lista.forEach((p) => {

        if (p.codigo) {

          const num = Number(

            String(p.codigo)
              .replace("A", "")

          );

          if (num > ultimo) {

            ultimo = num;

          }
        }
      });

      const nuevoCodigo =
        `A${ultimo + 1}`;

      // 🔥 NUEVO PRODUCTO
      const nuevoProducto = {

        codigo:
          nuevoCodigo,

        nombre:
          nuevo.nombre,

        compra:
          Number(
            nuevo.compra || 0
          ),

        venta:
          Number(
            nuevo.venta || 0
          ),

        stock:
          Number(
            nuevo.stock || 0
          ),

        categoria:
          nuevo.categoria || "",

        marca:
          nuevo.marca || "",

        proveedor:
          nuevo.proveedor || ""

      };

      // 🔥 FIREBASE
      const ref = await addDoc(

        collection(
          db,
          "inventario"
        ),

        nuevoProducto

      );

      // 🔥 LOCAL
      setLista((prev) => [

        ...prev,

        {

          id: ref.id,

          ...nuevoProducto

        }

      ]);

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

      alert(
        "✅ Producto agregado"
      );

    } catch (error) {

      console.error(error);

      alert(
        "❌ Error agregando"
      );

    }
  };

  // 🚀 EXPORTAR EXCEL
  const exportarExcel = () => {

    const datos = lista.map((p) => ({

      Codigo:
        p.codigo || "",

      Nombre:
        p.nombre || "",

      Compra:
        p.compra || 0,

      Venta:
        p.venta || 0,

      Stock:
        p.stock || 0,

      Categoria:
        p.categoria || "",

      Marca:
        p.marca || "",

      Proveedor:
        p.proveedor || ""

    }));

    const ws =
      XLSX.utils.json_to_sheet(
        datos
      );

    const wb =
      XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(

      wb,

      ws,

      "Inventario"

    );

    XLSX.writeFile(

      wb,

      `Inventario-${Date.now()}.xlsx`

    );
  };

  // 🚀 IMPORTAR EXCEL



  // 🚀 IMPORTADOR INTELIGENTE PRO MAX
const importarExcel = async (e) => {

  const file = e.target.files[0];

  if (!file) return;

  // 🔥 CONFIRMACIÓN
  const ok = window.confirm(

    "⚠️ IMPORTAR INVENTARIO\n\n" +

    "El sistema:\n\n" +

    "✅ Actualizará productos existentes\n" +

    "✅ Creará productos nuevos\n" +

    "❌ No eliminará inventario actual\n\n" +

    "¿Deseas continuar?"

  );

  if (!ok) {

    e.target.value = "";

    return;
  }

  try {

    const reader = new FileReader();

    reader.readAsArrayBuffer(file);

    reader.onload = async (evt) => {

      const data =
        new Uint8Array(
          evt.target.result
        );

      // 🔥 LEER EXCEL
      const workbook =
        XLSX.read(data, {
          type: "array"
        });

      // 🔥 PRIMERA HOJA
      const sheet =
        workbook.Sheets[
          workbook.SheetNames[0]
        ];

      // 🔥 JSON
      const productos =
        XLSX.utils
          .sheet_to_json(sheet);

      // 🔥 CONTADORES
      let creados = 0;

      let actualizados = 0;

      // 🔥 RECORRER
      for (const p of productos) {

        const codigoExcel =
          String(
            p.Codigo || ""
          ).trim();

        // 🚨 SIN CÓDIGO
        if (!codigoExcel)
          continue;

        // 🔥 BUSCAR EXISTENTE
        const existente =
          lista.find(

            (item) =>

              String(
                item.codigo || ""
              ).trim()

              === codigoExcel

          );

        // 🔥 DATOS LIMPIOS
        const datos = {

          codigo:
            codigoExcel,

          nombre:
            p.Nombre || "",

          compra:
            Number(
              p.Compra || 0
            ),

          venta:
            Number(
              p.Venta || 0
            ),

          stock:
            Number(
              p.Stock || 0
            ),

          categoria:
            p.Categoria || "",

          marca:
            p.Marca || "",

          proveedor:
            p.Proveedor || ""

        };

        // 🔥 ACTUALIZAR
        if (existente) {

          await updateDoc(

            doc(
              db,
              "inventario",
              existente.id
            ),

            datos

          );

          actualizados++;

        }

        // 🔥 CREAR
        else {

          await addDoc(

            collection(
              db,
              "inventario"
            ),

            datos

          );

          creados++;

        }
      }

      // 🔥 RECARGAR
      await cargar();

      // 🔥 ALERTA FINAL
      alert(

        "✅ IMPORTACIÓN COMPLETADA\n\n" +

        `🆕 Creados: ${creados}\n` +

        `🔄 Actualizados: ${actualizados}`

      );

      // 🔥 LIMPIAR INPUT
      e.target.value = "";

    };

  } catch (error) {

    console.error(error);

    alert(
      "❌ Error importando Excel"
    );

  }
};



  
  // 🔥 FILTRAR + ORDENAR
  const filtrados =
    useMemo(() => {

      let datos = lista.filter((p) =>

        (p.nombre || "")
          .toLowerCase()
          .includes(
            busqueda.toLowerCase()
          )

      );

      datos.sort((a, b) => {

        const valA =
          a[ordenCampo] || "";

        const valB =
          b[ordenCampo] || "";

        if (
          ordenDireccion === "asc"
        ) {

          return String(valA)
            .localeCompare(

              String(valB),

              undefined,

              {
                numeric: true,
                sensitivity:
                  "base"
              }

            );
        }

        return String(valB)
          .localeCompare(

            String(valA),

            undefined,

            {
              numeric: true,
              sensitivity:
                "base"
            }

          );

      });

      return datos;

    }, [

      lista,

      busqueda,

      ordenCampo,

      ordenDireccion

    ]);

  return (

    <div className="inventario-container">

      <h1>
        📦 INVENTARIO PRO MAX
      </h1>

      {/* BUSCAR */}
      <input
        className="buscar"
        placeholder="Buscar producto..."
        value={busqueda}
        onChange={(e) =>

          setBusqueda(
            e.target.value
          )

        }
      />

      {/* EXCEL */}
      <div className="excel-actions">

        <button
          onClick={exportarExcel}
          className="btn-excel"
        >
          📥 Exportar Excel
        </button>

        <label
          className="btn-import"
        >

          📤 Importar Excel

          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={
              importarExcel
            }
            hidden
          />

        </label>

      </div>

      {/* TABLA */}
      <div className="tabla-wrapper">

        {/* HEADERS */}
        <div className="row headers">

          <div
            onClick={() =>
              ordenarPor("codigo")
            }
          >
            Código
          </div>

          <div
            onClick={() =>
              ordenarPor("nombre")
            }
          >
            Nombre
          </div>

          <div
            onClick={() =>
              ordenarPor("compra")
            }
          >
            Compra
          </div>

          <div
            onClick={() =>
              ordenarPor("venta")
            }
          >
            Venta
          </div>

          <div
            onClick={() =>
              ordenarPor("stock")
            }
          >
            Stock
          </div>

          <div
            onClick={() =>
              ordenarPor("categoria")
            }
          >
            Categoría
          </div>

          <div
            onClick={() =>
              ordenarPor("marca")
            }
          >
            Marca
          </div>

          <div
            onClick={() =>
              ordenarPor("proveedor")
            }
          >
            Proveedor
          </div>

          <div></div>
          <div></div>
          <div></div>

        </div>

        {/* NUEVO */}
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

                nombre:
                  e.target.value

              })

            }
          />

          <input
            placeholder="Compra"
            value={nuevo.compra}
            onChange={(e)=>

              setNuevo({

                ...nuevo,

                compra:
                  e.target.value

              })

            }
          />

          <input
            placeholder="Venta"
            value={nuevo.venta}
            onChange={(e)=>

              setNuevo({

                ...nuevo,

                venta:
                  e.target.value

              })

            }
          />

          <input
            placeholder="Stock"
            value={nuevo.stock}
            onChange={(e)=>

              setNuevo({

                ...nuevo,

                stock:
                  e.target.value

              })

            }
          />

          <input
            placeholder="Categoría"
            value={nuevo.categoria}
            onChange={(e)=>

              setNuevo({

                ...nuevo,

                categoria:
                  e.target.value

              })

            }
          />

          <input
            placeholder="Marca"
            value={nuevo.marca}
            onChange={(e)=>

              setNuevo({

                ...nuevo,

                marca:
                  e.target.value

              })

            }
          />

          <input
            placeholder="Proveedor"
            value={nuevo.proveedor}
            onChange={(e)=>

              setNuevo({

                ...nuevo,

                proveedor:
                  e.target.value

              })

            }
          />

          <div></div>

          <button
            className="btn-add"
            onClick={agregar}
          >
            ➕
          </button>

          <div></div>

        </div>

        {/* LISTA */}
        {filtrados.map((p) => (

          <div
            key={p.id}
            className="row"
          >

            <input
              value={p.codigo || ""}
              disabled
              className="codigo"
            />

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

            <input
              value={
                p.categoria || ""
              }
              onChange={(e)=>

                cambiarLocal(

                  p.id,

                  "categoria",

                  e.target.value

                )

              }
            />

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

            <input
              value={
                p.proveedor || ""
              }
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

              {Number(p.stock) <= 5
                ? "⚠"
                : ""}

            </div>

            {/* SAVE */}
            <button
              className="btn-save"
              onClick={() =>
                guardar(p)
              }
            >
              💾
            </button>

            {/* DELETE */}
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

    </div>

  );
}
