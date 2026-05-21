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

import {
  crearMovimiento
} from "./kardexUtils";

export default function InventarioAdmin({ user }) {

  const [lista, setLista] =
    useState([]);

  const [busqueda, setBusqueda] =
    useState("");

  const [filtroStock, setFiltroStock] =
    useState("todos");

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

      minimo: "5",

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

          ...d.data(),

          stockOriginal:
            Number(d.data().stock || 0)

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
  const esStockBajo = (p) =>
    Number(p.stock || 0) > 0 &&
    Number(p.stock || 0) <=
      Number(p.minimo ?? 5);

  const estadisticas = useMemo(() => {

    const totalProductos = lista.length;

    const unidadesTotales = lista.reduce(
      (sum, p) =>
        sum + Number(p.stock || 0),
      0
    );

    const agotados = lista.filter(
      (p) => Number(p.stock || 0) <= 0
    ).length;

    const bajoStock = lista.filter(
      esStockBajo
    ).length;

    return {
      totalProductos,
      unidadesTotales,
      agotados,
      bajoStock
    };

  }, [lista]);

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

      const stockAnterior =
        Number(
          p.stockOriginal ?? p.stock ?? 0
        );

      const stockNuevo =
        Number(p.stock || 0);

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
            stockNuevo,

          minimo:
            Number(
              p.minimo ?? 5
            ),

          categoria:
            p.categoria || "",

          marca:
            p.marca || "",

          proveedor:
            p.proveedor || ""

        }

      );

      const diferencia =
        stockNuevo - stockAnterior;

      if (diferencia !== 0) {

        await crearMovimiento({

          producto:
            p.nombre || "",

          productoId:
            p.codigo || p.id,

          tipo:
            "AJUSTE",

          cantidad:
            diferencia,

          stockFinal:
            stockNuevo,

          usuario:
            user || "Admin"

        });

        setLista((prev) =>

          prev.map((item) =>

            item.id === p.id

              ? {

                  ...item,

                  stock:
                    stockNuevo,

                  stockOriginal:
                    stockNuevo

                }

              : item

          )

        );
      }

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

        minimo:
          Number(
            nuevo.minimo || 5
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

          ...nuevoProducto,

          stockOriginal:
            nuevoProducto.stock

        }

      ]);

      // 🔥 LIMPIAR
      setNuevo({

        nombre: "",

        compra: "",

        venta: "",

        stock: "",

        minimo: "5",

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
  const filaInventarioExcel = (p) => ({

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

    Minimo:
      p.minimo ?? 5,

    Categoria:
      p.categoria || "",

    Marca:
      p.marca || "",

    Proveedor:
      p.proveedor || ""

  });

  const exportarExcel = () => {

    const datos = lista.map(
      filaInventarioExcel
    );

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
  const exportarReposicion = () => {

    const productosReposicion =
      lista.filter((p) =>
        esStockBajo(p) ||
        Number(p.stock || 0) <= 0
      );

    if (productosReposicion.length === 0) {

      alert(
        "No hay productos para reposicion"
      );

      return;
    }

    const datos =
      productosReposicion.map((p) => {

        const stockActual =
          Number(p.stock || 0);

        const minimo =
          Number(p.minimo ?? 5);

        return {

          ...filaInventarioExcel(p),

          Faltante:
            Math.max(
              minimo - stockActual,
              0
            )

        };

      });

    const ws =
      XLSX.utils.json_to_sheet(
        datos
      );

    const wb =
      XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(

      wb,

      ws,

      "Reposicion"

    );

    XLSX.writeFile(

      wb,

      `Lista-reposicion-${Date.now()}.xlsx`

    );
  };

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

          minimo:
            Number(
              p.Minimo ?? 5
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

      const texto =
        busqueda.toLowerCase().trim();

      let datos = lista.filter((p) => {

        const coincideBusqueda =
          [
            p.codigo,
            p.nombre,
            p.categoria,
            p.marca,
            p.proveedor
          ]
            .join(" ")
            .toLowerCase()
            .includes(texto);

        const stockActual =
          Number(p.stock || 0);

        const coincideFiltro =
          filtroStock === "todos" ||
          (
            filtroStock === "bajo" &&
            esStockBajo(p)
          ) ||
          (
            filtroStock === "agotado" &&
            stockActual <= 0
          ) ||
          (
            filtroStock === "disponible" &&
            stockActual >
              Number(p.minimo ?? 5)
          );

        return (
          coincideBusqueda &&
          coincideFiltro
        );

      });

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

      filtroStock,

      ordenCampo,

      ordenDireccion

    ]);

  return (

    <div className="inventario-container">

      <h1>
        📦 INVENTARIO PRO MAX
      </h1>

      {/* BUSCAR */}
      <div className="inventario-resumen">

        <div>
          <span>Productos</span>
          <strong>{estadisticas.totalProductos}</strong>
        </div>

        <div>
          <span>Unidades</span>
          <strong>{estadisticas.unidadesTotales}</strong>
        </div>

        <div>
          <span>Stock bajo</span>
          <strong>{estadisticas.bajoStock}</strong>
        </div>

        <div>
          <span>Agotados</span>
          <strong>{estadisticas.agotados}</strong>
        </div>

      </div>

      <input
        className="buscar"
        placeholder="Buscar por codigo, nombre, categoria, marca o proveedor..."
        value={busqueda}
        onChange={(e) =>

          setBusqueda(
            e.target.value
          )

        }
      />

      <div className="inventario-filtros">

        <button
          className={
            filtroStock === "todos"
              ? "activo"
              : ""
          }
          onClick={() =>
            setFiltroStock("todos")
          }
        >
          Todos
        </button>

        <button
          className={
            filtroStock === "disponible"
              ? "activo"
              : ""
          }
          onClick={() =>
            setFiltroStock("disponible")
          }
        >
          Disponibles
        </button>

        <button
          className={
            filtroStock === "bajo"
              ? "activo"
              : ""
          }
          onClick={() =>
            setFiltroStock("bajo")
          }
        >
          Stock bajo
        </button>

        <button
          className={
            filtroStock === "agotado"
              ? "activo"
              : ""
          }
          onClick={() =>
            setFiltroStock("agotado")
          }
        >
          Agotados
        </button>

        <span>
          Mostrando {filtrados.length} de {lista.length}
        </span>

      </div>

      {/* EXCEL */}
      <div className="excel-actions">

        <button
          onClick={exportarExcel}
          className="btn-excel"
        >
          📥 Exportar Excel
        </button>

        <button
          onClick={exportarReposicion}
          className="btn-reposicion"
        >
          Lista de reposición
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
              ordenarPor("minimo")
            }
          >
            Mínimo
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
            placeholder="Mínimo"
            value={nuevo.minimo}
            onChange={(e)=>

              setNuevo({

                ...nuevo,

                minimo:
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
              value={p.minimo ?? 5}
              onChange={(e)=>

                cambiarLocal(

                  p.id,

                  "minimo",

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

              {esStockBajo(p) ||
                Number(p.stock || 0) <= 0
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
