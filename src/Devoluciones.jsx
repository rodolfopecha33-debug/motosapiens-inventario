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

import {
  ref,
  uploadBytes,
  getDownloadURL
}
from "firebase/storage";

import {
  storage
}
from "./firebase";


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
            cliente,
            telefono,

            estado: "pendiente",
            

            usuario:
              user || "Sistema",

            reintegraStock,

            imagenes: urls,

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

        await cargarHistorial();
        


        setProductoId("");

setCantidad(1);

setDetalle("");

setCliente("");

setTelefono("");

setBusqueda("");

setImagenes([]);

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
        onChange={(e)=>
          setBusqueda(
            e.target.value
          )
        }
      />

      {/* RESULTADOS */}
      <div className="resultados-productos">

        {productos

          .filter((p)=>

            p.nombre
              ?.toLowerCase()
              .includes(
                busqueda.toLowerCase()
              )

          )

          .slice(0,20)

          .map((p)=>(

            <div

              key={p.id}

              className="producto-dev"

              onClick={()=>
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

      {/* PRODUCTO SELECCIONADO */}
      {productoId && (

        <div className="producto-selected">

          <h3>
            Producto seleccionado
          </h3>

          <p>

            {

              productos.find(
                (p)=>
                  p.id === productoId
              )?.nombre

            }

          </p>

        </div>

      )}

      {/* GRID */}
      <div className="devolucion-grid">

        {/* CANTIDAD */}
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

      </div>

      {/* DETALLE */}
      <textarea
        className="devolucion-textarea"
        placeholder="Describe el motivo..."
        value={detalle}
        onChange={(e)=>

          setDetalle(
            e.target.value
          )

        }
      />

    <input

  key={fileKey}

  type="file"

  multiple

  accept="image/*"

  onChange={(e)=>

    setImagenes(

      [...e.target.files]

    )

  }

/>

      {/* BTN */}
      <button
        className="btn-devolucion"
        onClick={guardar}
      >

        Guardar devolución

      </button>

      <div className="historial-box">

  <h2>
    📋 Historial devoluciones
  </h2>

  {historial

    .slice()

    .reverse()

    .map((d)=>(

      <div
        key={d.id}
        className="historial-item"
      >

        <strong>
          {d.producto}
        </strong>

        <br />

        Cliente:
        {d.cliente || "N/A"}

        <br />

        Motivo:
        {d.motivo}

        <br />

        Detalle:
        {d.detalle}

        <br />

        Estado:
        {d.estado}

        <br />

        Usuario:
        {d.usuario}

        <br />

        {d.imagenes?.map((img,i)=>(

          <img
            key={i}
            src={img}
            alt=""
            width="100"
          />

        ))}

      </div>

  ))}

</div>

    </div>

  </div>

);
}
