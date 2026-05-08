import { db } from "./firebase";

import {

  collection,

  addDoc

} from "firebase/firestore";

// 🚀 CREAR MOVIMIENTO
export const crearMovimiento =
  async ({

    producto,

    codigo,

    tipo,

    cantidad,

    stockInicial,

    stockFinal,

    usuario,

    modulo,

    referencia

  }) => {

    try {

      await addDoc(

        collection(
          db,
          "movimientos"
        ),

        {

          fecha:
            Date.now(),

          producto:
            producto || "",

          codigo:
            codigo || "",

          tipo:
            tipo || "",

          cantidad:
            Number(
              cantidad || 0
            ),

          stockInicial:
            Number(
              stockInicial || 0
            ),

          stockFinal:
            Number(
              stockFinal || 0
            ),

          usuario:
            usuario || "Sistema",

          modulo:
            modulo || "",

          referencia:
            referencia || ""

        }

      );

    } catch (error) {

      console.error(

        "Error creando movimiento",

        error

      );

    }
};
