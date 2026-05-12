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
  serverTimestamp
} from "firebase/firestore";

import { db } from "./firebase";

import {
  crearMovimiento
} from "./kardexUtils";

import {
  ref,
  uploadBytes,
  getDownloadURL
} from "firebase/storage";

import {
  storage
} from "./firebase";

export default function Devoluciones({ user }) {

  const [productos,
    setProductos] =
      useState([]);

  const [productoId,
    setProductoId] =
      useState("");


      const [productoCambio,
  setProductoCambio] =
    useState("");

const [busquedaCambio,
  setBusquedaCambio] =
    useState("");
  
  

  const [cantidad,
    setCantidad] =
      useState(1);

  const [motivo,
    setMotivo] =
      useState("garantia");


  const [tipoResolucion,
  setTipoResolucion] =
    useState("");
  

  const [detalle,
    setDetalle] =
      useState("");

  const [busqueda,
    setBusqueda] =
      useState("");

  const [cliente,
    setCliente] =
      useState("");

  const [telefono,
    setTelefono] =
      useState("");

  const [imagenes,
    setImagenes] =
      useState([]);

  const [fileKey,
    setFileKey] =
      useState(Date.now());

  const [historial,
    setHistorial] =
      useState([]);

  // 🔥 CARGAR
  useEffect(() => {

    cargarProductos();
    cargarHistorial();

  }, []);

  // 🔥 PRODUCTOS
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

  // 🔥 HISTORIAL
  const cargarHistorial =
    async () => {

      const snap =
        await getDocs(

          collection(
            db,
            "devoluciones"
          )

        );

      const datos = [];

      snap.forEach((d) => {

        datos.push({

          id: d.id,

          ...d.data()

        });

      });

      setHistorial(datos);

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

      // 🔥 REINTEGRA STOCK
      const reintegraStock =

        motivo ===
        "insatisfaccion";

      let nuevoStock =
        Number(
          producto.stock || 0
        );

      // ✅ DEVOLUCIÓN
      // SUMAR STOCK
      if (reintegraStock) {

        nuevoStock +=
          Number(cantidad);

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

      // 🔥 CAMBIO PRODUCTO
      // DESCONTAR STOCK
      let productoCambioNombre =
        "";

      if (

        tipoResolucion ===
        "cambio"

        &&

        productoCambio

      ) {

        const nuevoProducto =

          productos.find(

            (p)=>

              p.id ===
              productoCambio

          );

        if (nuevoProducto) {

          productoCambioNombre =
            nuevoProducto.nombre;

          const nuevoStockCambio =

            Number(
              nuevoProducto.stock || 0
            ) - Number(cantidad);

          await updateDoc(

            doc(
              db,
              "inventario",
              nuevoProducto.id
            ),

            {

              stock:
                nuevoStockCambio

            }

          );

          // 🔥 KARDEX CAMBIO
          await crearMovimiento({

            producto:
              nuevoProducto.nombre,

            productoId:
              nuevoProducto.id,

            tipo:
              "CAMBIO_PRODUCTO",

            cantidad:
              Number(cantidad),

            stockFinal:
              nuevoStockCambio,

            usuario:
              user || "Sistema"

          });

        }

      }

      // 🔥 SUBIR IMÁGENES
      const urls = [];

      for (const img of imagenes) {

        const ruta = ref(

          storage,

          `garantias/${Date.now()}-${img.name}`

        );

        await uploadBytes(
          ruta,
          img
        );

        const url =
          await getDownloadURL(
            ruta
          );

        urls.push(url);

      }


      const estadoInicial =

  motivo ===
  "garantia"

    ? "pendiente"

    : "finalizado";

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

          tipoResolucion,

          cliente,

          telefono,

          estado:
            "pendiente",

          usuario:
            user || "Sistema",

          reintegraStock,

          imagenes:
            urls,

          productoCambio,

          productoCambioNombre,

          fecha:
            serverTimestamp()

        }

      );

      // 🔥 KARDEX DEVOLUCIÓN
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

      await cargarHistorial();

      // 🔥 LIMPIAR
      setProductoId("");

      setProductoCambio("");

      setBusquedaCambio("");

      setCantidad(1);

      setDetalle("");

      setCliente("");

      setTelefono("");

      setBusqueda("");

      setImagenes([]);

      setTipoResolucion("");

      setMotivo(
  "garantia"
);

      setFileKey(
        Date.now()
      );

    } catch (error) {

      console.log(error);

      alert(
        "Error guardando devolución"
      );

    }

  };

  

  return (

    <div className="devoluciones-container">

      <h1 className="devoluciones-title">
        🔄 Devoluciones PRO
      </h1>

      <div className="devolucion-card">

        {/* BUSQUEDA */}
        <input
          className="busqueda-pro"
          placeholder="Buscar producto..."
          value={busqueda}
          onChange={(e) =>
            setBusqueda(
              e.target.value
            )
          }
        />

        {/* RESULTADOS */}
        <div className="resultados-productos">

          {productos

            .filter((p) =>

              p.nombre
                ?.toLowerCase()
                .includes(
                  busqueda.toLowerCase()
                )

            )

            .slice(0, 20)

            .map((p) => (

              <div

                key={p.id}

                className="producto-dev"

                onClick={() =>
                  setProductoId(
                    p.id
                  )
                }
              >

                <div>

                <strong>
  {p.nombre}
</strong>
                  

                  <br />

                  <small>
                    Ref:
                    {p.codigo || "N/A"}
                  </small>

                </div>

                <span className="badge-stock">

                  Stock:
                  {p.stock}

                </span>

              </div>

          ))}

        </div>

        {/* PRODUCTO */}
        {productoId && (

          <div className="producto-selected">

            <h3>
              Producto seleccionado
            </h3>

            <p>

              {

                productos.find(
                  (p) =>
                    p.id === productoId
                )?.nombre

              }

            </p>

          </div>

        )}

       {/* GRID */}
<div className="devolucion-grid">

  <input
    type="number"
    className="devolucion-input"
    placeholder="Cantidad"
    value={cantidad}
    onChange={(e)=>

      setCantidad(
        e.target.value
      )

    }
  />

  <input
    className="devolucion-input"
    placeholder="Cliente"
    value={cliente}
    onChange={(e)=>

      setCliente(
        e.target.value
      )

    }
  />

  <input
    className="devolucion-input"
    placeholder="Teléfono"
    value={telefono}
    onChange={(e)=>

      setTelefono(
        e.target.value
      )

    }
  />

</div>

{/* MOTIVO */}
<select
  className="devolucion-select"
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

{/* 🔥 RESOLUCIÓN VISUAL */}
{

  motivo ===
  "insatisfaccion"

  &&

  <div
    className="resolucion-box"
  >

    {/* CAMBIO */}
    <div

      className={

        tipoResolucion ===
        "cambio"

          ? "res-card active"

          : "res-card"

      }

      onClick={()=>

        setTipoResolucion(
          "cambio"
        )

      }
    >

      <div
        style={{
          fontSize: 35
        }}
      >
        🔄
      </div>

      <h3>
        Cambio producto
      </h3>

    </div>

    {/* DINERO */}
    <div

      className={

        tipoResolucion ===
        "dinero"

          ? "res-card active red"

          : "res-card red"

      }

      onClick={()=>

        setTipoResolucion(
          "dinero"
        )

      }
    >

      <div
        style={{
          fontSize: 35
        }}
      >
        💵
      </div>

      <h3>
        Devolución dinero
      </h3>

    </div>

  </div>

}


        {

  tipoResolucion ===
  "cambio"

  &&

  <div
    className="
    cambio-box
    "
  >

    <h3>
      🔄 Producto reemplazo
    </h3>

    <input
      className="
      busqueda-pro
      "
      placeholder="
      Buscar producto nuevo...
      "
      value={
        busquedaCambio
      }
      onChange={(e)=>

        setBusquedaCambio(
          e.target.value
        )

      }
    />

  </div>

}

              

         <div
  className="
  resultados-productos
  "
>

  {

    productos

      .filter((p)=>

        p.nombre
          ?.toLowerCase()
          .includes(

            busquedaCambio
              .toLowerCase()

          )

      )

      .slice(0, 10)

      .map((p)=>(

        <div

          key={p.id}

          className="
          producto-dev
          "

          onClick={()=>

            setProductoCambio(
              p.id
            )

          }
        >

          <strong>
            {p.nombre}
          </strong>

          <br />

          Stock:
          {p.stock}

        </div>

      ))

  }

</div>


        {

  productoCambio

  &&

  <div
    className="
    producto-selected
    "
  >

    <h3>
      Producto reemplazo:
    </h3>

    <p>

      {

        productos.find(

          (p)=>

            p.id ===
            productoCambio

        )?.nombre

      }

    </p>

  </div>

}
           

       

        {/* DETALLE */}
        <textarea
          className="devolucion-textarea"
          placeholder="Describe el motivo..."
          value={detalle}
          onChange={(e) =>

            setDetalle(
              e.target.value
            )

          }
        />

        {/* IMÁGENES */}
        <input

          key={fileKey}

          type="file"

          multiple

          accept="image/*"

          onChange={(e) =>

            setImagenes(

              [...e.target.files]

            )

          }

        />

        {/* BOTÓN */}
        <button
          className="btn-devolucion"
          onClick={guardar}
        >

          Guardar devolución

        </button>

         
         {/* HISTORIAL */}
<div className="historial-box">

  <h2>
    📋 Historial devoluciones
  </h2>

  {

    Array.isArray(historial)

    &&
    
    
    
   historial
  .slice()
  .reverse()
    
  .filter(

    (d) =>

      d.motivo ===
      "insatisfaccion"

  )
  .map((d) => {

      return (

        <div
          key={d.id}
          className="historial-item"
        >

          <strong>
            {String(d.producto || "")}
          </strong>

          <br />

          Cliente:
          {" "}
          {String(d.cliente || "")}

          <br />

          Motivo:
          {" "}
          {String(d.motivo || "")}

          <br />


          

<p>

  🔄 Resolución:
  {" "}

  <strong>

    {

      d.tipoResolucion ===
      "cambio"

        ? "Cambio producto"

        : "Devolución dinero"

    }

  </strong>

</p>

        {

  d.tipoResolucion ===
  "cambio"

  &&

  <p>

    📦 Producto entregado:
    {" "}

    <strong>

      {
        d.productoCambioNombre
      }

    </strong>

  </p>

}
          

            <br />

          Detalle:
          {" "}
          {String(d.detalle || "")}

          <br />

          Estado:
          {" "}
          {String(d.estado || "")}

          <br />

         Usuario:
{" "}

{
  typeof d.usuario === "object"

    ? d.usuario.nombre

    : d.usuario || "Sistema"
}

          <br />

          <br />

Fecha:
{" "}

{
  d.fecha?.toDate
    ? d.fecha
        .toDate()
        .toLocaleString()
    : ""
}

          <div className="historial-imagenes">

            {

              Array.isArray(d.imagenes)

              &&

              d.imagenes.map((img, i) => (

                <img
                  key={i}
                  src={img}
                  alt=""
                  width="100"
                />

              ))

            }

          </div>

        </div>

      );

    })

  }

</div>
      
      </div>

    </div>

  );
}
