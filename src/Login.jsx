import React, { useState } from "react";
import { auth } from "./firebase";
import {
  signInWithEmailAndPassword
} from "firebase/auth";

function mensajeAuth(codigo) {
  const mensajes = {
    "auth/invalid-credential":
      "Credenciales invalidas. Verifica que el usuario exista en Authentication y que la contrasena sea correcta.",
    "auth/user-disabled":
      "Este usuario esta deshabilitado en Firebase Authentication.",
    "auth/operation-not-allowed":
      "El acceso con correo y contrasena no esta habilitado en Firebase.",
    "auth/too-many-requests":
      "Demasiados intentos. Espera unos minutos o restablece la contrasena.",
    "auth/network-request-failed":
      "No se pudo conectar con Firebase. Revisa tu conexion a internet."
  };

  return mensajes[codigo] ||
    `No se pudo iniciar sesion (${codigo || "error desconocido"}).`;
}

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] =
    useState("");
  const [mostrarPassword, setMostrarPassword] =
    useState(false);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const entrar = async () => {
    const emailLimpio =
      email.trim().toLowerCase();

    if (!emailLimpio || !password) {
      setError(
        "Ingresa el correo y la contrasena."
      );
      return;
    }

    setCargando(true);
    setError("");

    try {
      await signInWithEmailAndPassword(
        auth,
        emailLimpio,
        password
      );
    } catch (error) {
      console.error(error);
      setError(mensajeAuth(error.code));
    } finally {
      setCargando(false);
    }
  };

  return (
    <main className="login-screen">
      <section className="login-box">
        <div className="login-brand">
          <span className="login-brand-mark">
            M
          </span>
          <div>
            <h1>MOTOSAPIENS</h1>
            <span>Inventario y punto de venta</span>
          </div>
        </div>

        <div className="login-heading">
          <h2>Bienvenido</h2>
          <p>
            Ingresa tus credenciales para continuar.
          </p>
        </div>

        <form
          className="login-form"
          onSubmit={(e) => {
            e.preventDefault();
            entrar();
          }}
        >
          <label htmlFor="login-email">
            Correo electronico
          </label>
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            placeholder="correo@empresa.com"
            disabled={cargando}
          />

          <label htmlFor="login-password">
            Contrasena
          </label>
          <div className="login-password-field">
            <input
              id="login-password"
              type={
                mostrarPassword
                  ? "text"
                  : "password"
              }
              autoComplete="current-password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              placeholder="Ingresa tu contrasena"
              disabled={cargando}
            />

            <button
              type="button"
              className="login-password-toggle"
              onClick={() =>
                setMostrarPassword(
                  (visible) => !visible
                )
              }
              aria-label={
                mostrarPassword
                  ? "Ocultar contrasena"
                  : "Mostrar contrasena"
              }
              title={
                mostrarPassword
                  ? "Ocultar contrasena"
                  : "Mostrar contrasena"
              }
            >
              <span
                className={
                  mostrarPassword
                    ? "login-eye"
                    : "login-eye login-eye-hidden"
                }
                aria-hidden="true"
              >
              </span>
            </button>
          </div>

          {error && (
            <div
              className="login-error"
              role="alert"
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={cargando}
          >
            {cargando
              ? "Validando..."
              : "Iniciar sesion"}
          </button>
        </form>
      </section>
    </main>
  );
}
