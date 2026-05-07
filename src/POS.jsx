import React, {
  useEffect,
  useState,
  useMemo
} from "react";

import { db } from "./firebase";

import ConfirmModal from "./ConfirmModal";

import {
  collection,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  writeBatch
} from "firebase/firestore";

import {
  guardarCache,
  leerCache
} from "./cacheUtils";

export default function POS({ user }) {

  const [busqueda, setBusqueda] =
    useState("");

  const [carrito, setCarrito] =
    useState([]);

  const [lista, setLista] =
    useState([]);

  const [telefono, setTelefono] =
    useState("");

  const [cargando, setCargando] =
    useState(true);

  const [mostrarConfirm,
    setMostrarConfirm] =
      useState(false);

  const [metodoPago,
    setMetodoPago] =
      useState("efectivo");

  const [recibido,
    setRecibido] =
      useState("");

  // 🔥 CARGAR INVENTARIO
  useEffect(() => {
    cargarInventario();
  }, []);

  // 🔥 INVENTARIO
  const cargarInventario =
    async () => {

      try {

        // 🔥 CACHE LOCAL
        const cache =
          leerCache(
            "inventario"
          );

        if (cache) {
          setLista(cache);
        }

        // 🔥 FIREBASE
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

        // 🔥 CACHE
        guardarCache(
          "inventario",
          datos
        );

        setCargando(false);

      } catch (error) {

        console.error(error);

        setCargando(false);

      }
    };

  // 🔥 HELPERS
  const nombre = (p) =>
    p.nombre || "Sin nombre";

  const precio = (p) =>
    Number(p.venta || 0);

  const stock = (p) =>
    Number(p.stock || 0);

  const codigo = (p) =>
    String(p.codigo || "");

  // 🔥 FILTRO OPTIMIZADO
  const productosFiltrados =
    useMemo(() => {

      return lista.filter((p) =>

        nombre(p)
          .toLowerCase()
          .includes(
            busqueda.toLowerCase()
          ) ||

        codigo(p)
          .includes(busqueda)

      );

    }, [lista, busqueda]);

  // ➕ AGREGAR
  const agregar = (p) => {

    if (stock(p) <= 0) {

      alert("Sin stock");

      return;
    }

    const existe =
      carrito.find(
        (i) => i.id === p.id
      );

    if (existe) {

      setCarrito(

        carrito.map((i) =>

          i.id === p.id

            ? {
                ...i,
                cantidad:
                  i.cantidad + 1
              }

            : i

        )

      );

    } else {

      setCarrito([

        ...carrito,

        {
          ...p,
          cantidad: 1
        }

      ]);

    }
  };

  // ➕ AUMENTAR
  const aumentar = (id) => {

    setCarrito(

      carrito.map((i) =>

        i.id === id

          ? {
              ...i,
              cantidad:
                i.cantidad + 1
            }

          : i

      )

    );
  };

  // ➖ DISMINUIR
  const disminuir = (id) => {

    const item =
      carrito.find(
        (i) => i.id === id
      );

    if (item.cantidad === 1) {

      eliminar(id);

      return;
    }

    setCarrito(

      carrito.map((i) =>

        i.id === id

          ? {
              ...i,
              cantidad:
                i.cantidad - 1
            }

          : i

      )

    );
  };

  // 🗑 ELIMINAR
  const eliminar = (id) => {

    setCarrito(

      carrito.filter(
        (i) => i.id !== id
      )

    );
  };

  // 💰 TOTAL
  const total = carrito.reduce(

    (sum, i) =>

      sum +
      precio(i) *
      i.cantidad,

    0

  );

  // 💵 CAMBIO
  const cambio =

    metodoPago === "efectivo"

      ? Number(recibido || 0)
          - total

      : 0;

  // 🔥 VENTA
  const ejecutarVenta =
    async () => {

      if (
        carrito.length === 0
      ) return;

      // 💵 VALIDAR
      if (

        metodoPago === "efectivo" &&

        Number(recibido) < total

      ) {

        alert(
          "Dinero insuficiente"
        );

        return;
      }

      try {

        // 🔥 BATCH
        const batch =
          writeBatch(db);

        for (const item of carrito) {

          const ref = doc(

            db,

            "inventario",

            item.id

          );

          // 🔥 UPDATE STOCK
          batch.update(ref, {

            stock:

              stock(item) -
              item.cantidad

          });

          // 🔥 MOVIMIENTO
          await addDoc(

            collection(
              db,
              "movimientos"
            ),

            {

              tipo: "venta",

              producto:
                item.nombre,

              cantidad:
                item.cantidad,

              fecha:
                new Date()
                  .toLocaleString()

            }

          );
        }

        // 🔥 EJECUTAR BATCH
        await batch.commit();

        // 🔥 GUARDAR VENTA
        await addDoc(

          collection(
            db,
            "ventas"
          ),

          {

            fecha:
              new Date()
                .toLocaleString(),

            usuario: user,

            productos:
              carrito,

            total,

            metodoPago,

            recibido:
              Number(
                recibido || 0
              ),

            cambio

          }

        );

        // 🔥 STOCK LOCAL
        const nuevaLista =
          lista.map((prod) => {

            const vendido =
              carrito.find(

                (i) =>
                  i.id === prod.id

              );

            if (!vendido)
              return prod;

            return {

              ...prod,

              stock:

                Number(
                  prod.stock
                ) -

                vendido.cantidad

            };
          });

        // 🔥 LOCAL
        setLista(nuevaLista);

        // 🔥 CACHE
        guardarCache(
          "inventario",
          nuevaLista
        );

        // 🔥 LIMPIAR
        setCarrito([]);

        setTelefono("");

        setRecibido("");

        setMetodoPago(
          "efectivo"
        );

      } catch (error) {

        console.error(error);

        alert(
          "Error realizando venta"
        );

      }
    };

  // ⏳ LOADING
  if (cargando) {

    return (

      <div
        style={{
          padding: 30
        }}
      >
        Cargando...
      </div>

    );
  }

  return (

    <div className="pos-layout">

      {/* PRODUCTOS */}
      <div className="productos-panel">

        <h2>
          🔥 POS FINAL PRO
        </h2>

        <input
          placeholder="Buscar o escanear..."
          value={busqueda}
          onChange={(e) =>
            setBusqueda(
              e.target.value
            )
          }
        />

        <div className="productos-lista">

          {productosFiltrados
            .slice(0, 80)
            .map((p) => (

            <div
              key={p.id}
              className="producto-card-max"
              onClick={() =>
                agregar(p)
              }
            >

              {/* IZQUIERDA */}
              <div className="producto-left">

                <div className="producto-img">
                  🏍️
                </div>

                <div className="producto-text">

                  <div className="producto-nombre">

                    {nombre(p)}

                  </div>

                  <div className="producto-sub">

                    Ref:
                    {p.codigo || "N/A"}

                  </div>

                  <div className="producto-stock">

                    Stock:
                    {stock(p)}

                  </div>

                </div>

              </div>

              {/* DERECHA */}
              <div className="producto-right-max">

                <div className="precio-row">

                  <span className="producto-precio">

                    ${precio(p)}

                  </span>

                  <button
                    className="btn-add-max"
                    onClick={(e) => {

                      e.stopPropagation();

                      agregar(p);

                    }}
                  >
                    +
                  </button>

                </div>

                {stock(p) <= 5 && (

                  <span className="badge-stock-max">

                    ⚠ Bajo

                  </span>

                )}

              </div>

            </div>

          ))}

        </div>

      </div>

      {/* CARRITO */}
      <div className="carrito-panel">

        <h2>
          📦 Carrito
        </h2>

        {carrito.length === 0 && (

          <p className="empty">

            🛒 No hay productos

          </p>

        )}

        {carrito.map((x) => (

          <div
            key={x.id}
            className="carrito-item"
          >

            <div>

              {nombre(x)}

              <br />

              <span className="precio-mini">

                ${precio(x)} x {x.cantidad}

              </span>

            </div>

            <div className="acciones">

              <button
                onClick={() =>
                  disminuir(x.id)
                }
              >
                −
              </button>

              <button
                onClick={() =>
                  aumentar(x.id)
                }
              >
                +
              </button>

              <button
                onClick={() =>
                  eliminar(x.id)
                }
              >
                🗑
              </button>

            </div>

          </div>

        ))}

        <h3>
          Total: ${total}
        </h3>

        {/* PAGO */}
        <select
          value={metodoPago}
          onChange={(e) =>

            setMetodoPago(
              e.target.value
            )

          }
        >

          <option value="efectivo">
            Efectivo
          </option>

          <option value="nequi">
            Nequi
          </option>

          <option value="daviplata">
            Daviplata
          </option>

          <option value="tarjeta">
            Tarjeta
          </option>

        </select>

        {/* EFECTIVO */}
        {metodoPago ===
          "efectivo" && (

          <>

            <input
              placeholder="Dinero recibido"
              value={recibido}
              onChange={(e) =>

                setRecibido(
                  e.target.value
                )

              }
            />

            <p className="cambio">

              Cambio: ${cambio}

            </p>

          </>

        )}

        {/* TELÉFONO */}
        <input
          placeholder="Cliente WhatsApp"
          value={telefono}
          onChange={(e) =>
            setTelefono(
              e.target.value
            )
          }
        />

        {/* COBRAR */}
        <button
          onClick={() =>
            setMostrarConfirm(true)
          }

          disabled={
            carrito.length === 0
          }

          className="btn-cobrar"
        >

          Cobrar

        </button>

      </div>

      {/* MODAL */}
      <ConfirmModal
        open={mostrarConfirm}
        total={total}
        message="¿Confirmar venta?"
        onCancel={() =>

          setMostrarConfirm(false)

        }
        onConfirm={async () => {

          setMostrarConfirm(false);

          await ejecutarVenta();

        }}
      />

    </div>

  );
}
