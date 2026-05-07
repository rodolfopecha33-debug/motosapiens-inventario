import { db } from "./firebase";

import {

  collection,

  getDocs,

  doc,

  updateDoc

} from "firebase/firestore";

// 🚀 MIGRAR FECHAS DEFINITIVO
export const migrarFechas =
  async () => {

    try {

      const ok = window.confirm(

        "⚠️ MIGRAR FECHAS\n\n" +

        "Convertirá fechas texto\n" +

        "a timestamps reales.\n\n" +

        "¿Continuar?"

      );

      if (!ok) return;

      const snap =
        await getDocs(

          collection(
            db,
            "ventas"
          )

        );

      let migradas = 0;

      for (const d of snap.docs) {

        const venta = d.data();

        // 🔥 SOLO STRINGS
        if (
          typeof venta.fecha !==
          "string"
        ) {

          continue;

        }

        try {

          // 🔥 EJEMPLO:
          // 4/5/2026, 9:12:03 p. m.

          const texto =
            venta.fecha

              .replace(
                "p. m.",
                "PM"
              )

              .replace(
                "a. m.",
                "AM"
              );

          // 🔥 SEPARAR
          const [fechaPart,
            horaPart] =
              texto.split(",");

          // 🔥 DD/MM/YYYY
          const partes =
            fechaPart
              .trim()
              .split("/");

          const dia =
            partes[0];

          const mes =
            partes[1];

          const anio =
            partes[2];

          // 🔥 ISO CORRECTO
          const iso =

            `${anio}-${mes}-${dia} ${horaPart.trim()}`;

          const fecha =
            new Date(iso);

          // 🚨 INVALID
          if (
            isNaN(fecha)
          ) {

            console.log(
              "INVALID:",
              texto
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

      alert(

        "✅ MIGRACIÓN COMPLETADA\n\n" +

        `🔄 Migradas: ${migradas}`

      );

    } catch (error) {

      console.error(error);

      alert(
        "❌ Error migrando"
      );

    }
};
