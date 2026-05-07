import { db } from "./firebase";

import {

  collection,

  getDocs,

  doc,

  updateDoc

} from "firebase/firestore";

// 🚀 MIGRADOR DEFINITIVO
export const migrarFechas =
  async () => {

    try {

      const ok = window.confirm(

        "⚠️ MIGRAR FECHAS\n\n" +

        "Convertirá fechas antiguas\n" +

        "DD/MM/YYYY → timestamp\n\n" +

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

      let ignoradas = 0;

      for (const d of snap.docs) {

        const venta = d.data();

        // 🔥 YA TIMESTAMP
        if (

          typeof venta.fecha ===
          "number"

          &&

          venta.fechaTexto

        ) {

          ignoradas++;

          continue;

        }

        // 🔥 FECHA ORIGINAL
        const original =

          venta.fechaTexto ||

          venta.fecha;

        // 🚨 NO STRING
        if (
          typeof original !==
          "string"
        ) {

          continue;

        }

        try {

          // 🔥 LIMPIAR
          const texto =
            original

              .replace(
                "p. m.",
                "PM"
              )

              .replace(
                "a. m.",
                "AM"
              );

          // 🔥 DIVIDIR
          const partes =
            texto.split(",");

          const fechaPart =
            partes[0].trim();

          const horaPart =
            partes[1]?.trim() ||
            "12:00 AM";

          // 🔥 DD/MM/YYYY
          const [
            dia,
            mes,
            anio
          ] =
            fechaPart.split("/");

          // 🔥 ISO
          const iso =

            `${anio}-${mes}-${dia} ${horaPart}`;

          const fecha =
            new Date(iso);

          // 🚨 INVALID
          if (
            isNaN(fecha)
          ) {

            console.log(
              "Fecha inválida:",
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
                original

            }

          );

          migradas++;

        } catch (err) {

          console.error(err);

        }
      }

      alert(

        "✅ MIGRACIÓN COMPLETADA\n\n" +

        `🔄 Migradas: ${migradas}\n` +

        `⏭ Ignoradas: ${ignoradas}`

      );

    } catch (error) {

      console.error(error);

      alert(
        "❌ Error migrando"
      );

    }
};
