import React, { useEffect, useState } from "react";
import Login from "./Login";
import POS from "./POS";
import Dashboard from "./Dashboard";
import Caja from "./Caja";
import InventarioAdmin from "./InventarioAdmin";
import Compras from "./Compras";
import Kardex from "./Kardex";
import Devoluciones from "./Devoluciones";
import SeguimientoGarantias from "./SeguimientoGarantias";
import Gastos from "./Gastos";
import { auth, db } from "./firebase";
import {
  onAuthStateChanged,
  signOut
} from "firebase/auth";
import {
  doc,
  getDoc
} from "firebase/firestore";

export default function App() {
  const [user, setUser] = useState(null);
  const [cargandoSesion, setCargandoSesion] =
    useState(true);
  const [vista, setVista] = useState("pos");

  useEffect(() => {
    const unsubscribe =
      onAuthStateChanged(
        auth,
        async (firebaseUser) => {
          if (!firebaseUser) {
            setUser(null);
            setCargandoSesion(false);
            return;
          }

          try {
            const perfilSnap = await getDoc(
              doc(
                db,
                "usuarios",
                firebaseUser.uid
              )
            );

            if (!perfilSnap.exists()) {
              await signOut(auth);
              setUser(null);
              alert(
                "Tu usuario no tiene perfil asignado"
              );
              return;
            }

            const perfil = perfilSnap.data();

            if (perfil.activo === false) {
              await signOut(auth);
              setUser(null);
              alert(
                "Tu usuario esta desactivado"
              );
              return;
            }

            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              nombre:
                perfil.nombre ||
                firebaseUser.email,
              rol: perfil.rol || "cajero"
            });
          } catch (error) {
            console.error(error);
            await signOut(auth);
            setUser(null);
            alert(
              "No se pudo cargar tu perfil"
            );
          } finally {
            setCargandoSesion(false);
          }
        }
      );

    return () => {
      unsubscribe();
    };
  }, []);

  const salir = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error(error);
      alert(
        "No se pudo cerrar sesion"
      );
    }
  };

  if (cargandoSesion) {
    return (
      <div
        style={{
          padding: 30,
          color: "white"
        }}
      >
        Cargando sesion...
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  const esAdmin = user.rol === "admin";

  return (
    <div>
      <div style={topbarStyle()}>
        <div
          style={{
            color: "white",
            fontWeight: "bold"
          }}
        >
          {user.nombre} ({user.rol})
        </div>

        <div style={menuStyle()}>
          <button
            style={btn()}
            onClick={() => setVista("pos")}
          >
            POS
          </button>

          {esAdmin && (
            <button
              style={btn()}
              onClick={() =>
                setVista("dashboard")
              }
            >
              Dashboard
            </button>
          )}

          {esAdmin && (
            <button
              style={btn()}
              onClick={() =>
                setVista("caja")
              }
            >
              Caja
            </button>
          )}

          {esAdmin && (
            <button
              style={btn()}
              onClick={() =>
                setVista("inventario")
              }
            >
              Inventario
            </button>
          )}

          {esAdmin && (
            <button
              style={btn()}
              onClick={() =>
                setVista("compras")
              }
            >
              Compras
            </button>
          )}

          {esAdmin && (
            <button
              style={btn()}
              onClick={() =>
                setVista("kardex")
              }
            >
              Kardex
            </button>
          )}

          <button
            style={btn()}
            onClick={() =>
              setVista("devoluciones")
            }
          >
            Devoluciones
          </button>

          <button
            style={btn()}
            onClick={() =>
              setVista("seguimiento")
            }
          >
            Garantias
          </button>

          {esAdmin && (
            <button
              style={btn()}
              onClick={() =>
                setVista("gastos")
              }
            >
              Gastos
            </button>
          )}

          <button
            onClick={salir}
            style={salirStyle()}
          >
            Salir
          </button>
        </div>
      </div>

      {vista === "pos" && (
        <POS user={user.nombre} />
      )}

      {vista === "dashboard" &&
        esAdmin && <Dashboard />}

      {vista === "caja" &&
        esAdmin && <Caja />}

      {vista === "inventario" &&
        esAdmin && (
          <InventarioAdmin user={user} />
        )}

      {vista === "compras" &&
        esAdmin && <Compras />}

      {vista === "kardex" &&
        esAdmin && <Kardex />}

      {vista === "devoluciones" && (
        <Devoluciones user={user} />
      )}

      {vista === "seguimiento" && (
        <SeguimientoGarantias />
      )}

      {vista === "gastos" &&
        esAdmin && <Gastos user={user} />}
    </div>
  );
}

function topbarStyle() {
  return {
    background: "#111",
    padding: "14px 20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "10px"
  };
}

function menuStyle() {
  return {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap"
  };
}

function btn() {
  return {
    background: "#16b84e",
    color: "white",
    border: "none",
    padding: "10px 16px",
    borderRadius: "8px",
    cursor: "pointer"
  };
}

function salirStyle() {
  return {
    background: "#ff2a2a",
    color: "white",
    border: "none",
    padding: "10px 16px",
    borderRadius: "8px",
    cursor: "pointer"
  };
}
