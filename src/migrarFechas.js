import { db } from "./firebase";

import {

  collection,

  getDocs,

  doc,

  updateDoc

} from "firebase/firestore";

// 🚀 MIGRAR FECHAS
export const migrarFechas =
  async () => {

    try {

      const ok = window.confirm(

        "⚠️ MIGRAR FECHAS\n\n" +

        "Esto convertirá las fechas viejas " +

        "a timestamps reales.\n\n" +

        "¿Deseas continuar?"

      );

      if (!ok) return;

      // 🔥 LEER VENTAS
      const snap =
        await getDocs(

          collection(
            db,
            "ventas"
          )

        );

      let migradas = 0;

      let ignoradas = 0;

      // 🔥 RECORRER
      for (const d of snap.docs) {

        const venta = d.data();

        // 🔥 YA ES TIMESTAMP
        if (
          typeof venta.fecha ===
          "number"
        ) {

          ignoradas++;

          continue;
        }

        // 🔥 STRING
        if (
          typeof venta.fecha ===
          "string"
        ) {

          try {

            // 🔥 LIMPIAR
            const limpia =
              venta.fecha

                .replace(
                  "p. m.",
                  "PM"
                )

                .replace(
                  "a. m.",
                  "AM"
                );

            // 🔥 PARSE
            const fecha =
              new Date(limpia);

            // 🚨 INVALID
            if (
              isNaN(fecha)
            ) {

              console.log(
                "Fecha inválida:",
                venta.fecha
              );

              continue;
            }

            // 🔥 UPDATE
            await updateDoc(

              doc(
                db,
                "ventas",
                d.id
              ),

              {

                fecha:
                  fecha.getTime(),

                fechaTexto:
                  venta.fecha

              }

            );

            migradas++;

          } catch (err) {

            console.error(err);

          }
        }
      }

      // 🔥 FINAL
      alert(

        "✅ MIGRACIÓN COMPLETADA\n\n" +

        `🔄 Migradas: ${migradas}\n` +

        `⏭ Ignoradas: ${ignoradas}`

      );

    } catch (error) {

      console.error(error);

      alert(
        "❌ Error migrando fechas"
      );

    }
};
