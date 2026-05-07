
import { db } from "./firebase";

import {

  collection,

  getDocs,

  doc,

  updateDoc

} from "firebase/firestore";

// 🚀 FIX MAYO DIRECTO FIREBASE
export const fixFechasMayo =
  async () => {

    try {

      const ok = window.confirm(

        "⚠️ CORREGIR FECHAS FIREBASE\n\n" +

        "Buscará TODAS las ventas\n" +

        "directamente en Firebase.\n\n" +

        "¿Continuar?"

      );

      if (!ok) return;

      // 🔥 LEER FIREBASE DIRECTO
      const snap =
        await getDocs(

          collection(
            db,
            "ventas"
          )

        );

      let corregidas = 0;

      console.log(
        "TOTAL DOCS:",
        snap.docs.length
      );

      for (const d of snap.docs) {

        const venta = d.data();

        console.log(venta);

        // 🔥 STRING
        if (
          typeof venta.fecha ===
          "string"
        ) {

          const texto =
            venta.fecha;

          // 🔥 SI CONTIENE 4/5/2026
          if (

            texto.includes(
              "4/5/2026"
            )

          ) {

            try {

              // 🔥 LIMPIAR
              const limpia =
                texto

                  .replace(
                    "p. m.",
                    "PM"
                  )

                  .replace(
                    "a. m.",
                    "AM"
                  );

              const partes =
                limpia.split(",");

              const hora =
                partes[1]?.trim() ||
                "12:00 AM";

              // 🔥 FECHA CORRECTA
              const nueva =
                new Date(

                  2026,

                  4, // mayo

                  4

                );

              const horaDate =
                new Date(
                  `2000-01-01 ${hora}`
                );

              nueva.setHours(
                horaDate.getHours()
              );

              nueva.setMinutes(
                horaDate.getMinutes()
              );

              nueva.setSeconds(
                horaDate.getSeconds()
              );

              // 🔥 UPDATE
              await updateDoc(

                doc(
                  db,
                  "ventas",
                  d.id
                ),

                {

                  fecha:
                    nueva.getTime(),

                  fechaTexto:
                    texto

                }

              );

              corregidas++;

            } catch (err) {

              console.log(err);

            }
          }
        }
      }

      alert(

        `✅ Corregidas: ${corregidas}`

      );

    } catch (error) {

      console.error(error);

      alert(
        "❌ Error corrigiendo"
      );

    }
};
