import {
  addDoc,
  collection,
  serverTimestamp
} from "firebase/firestore";

import { db } from "./firebase";

export const crearMovimiento =
  async ({

    producto,
    productoId,
    tipo,
    cantidad,
    stockFinal,
    usuario,
    metodoPago,
    ventaId

  }) => {

    try {

      await addDoc(

        collection(
          db,
          "movimientos"
        ),

        {

          producto,
          productoId,

          tipo:
            String(tipo)
              .toUpperCase(),

          cantidad,

          stockFinal,

          usuario:
            typeof usuario === "object"

    ? usuario?.nombre

    : usuario || "Sistema",

          metodoPago:
            metodoPago || "",

          ...(ventaId ? { ventaId } : {}),

          fecha:
            serverTimestamp(),

        }

      );

    } catch (error) {

      console.log(
        "Error creando movimiento",
        error
      );

    }
  };
