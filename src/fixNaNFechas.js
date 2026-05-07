import { db } from "./firebase";

import {

  collection,

  getDocs,

  doc,

  updateDoc

} from "firebase/firestore";

// 🚀 FIX FECHAS NaN
export const fixNaNFechas =
  async () => {

    try {

      const ok = window.confirm(

        "⚠️ CORREGIR FECHAS NaN\n\n" +

        "Reconstruirá fechas dañadas.\n\n" +

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

      let corregidas = 0;

      for (const d of snap.docs) {

        const venta = d.data();

        // 🔥 SOLO NaN
        if (

          Number.isNaN(
            venta.fecha
          )

        ) {

          try {

            // 🔥 USAR fechaTexto
            const texto =
              venta.fechaTexto

                .replace(
                  "p. m.",
                  "PM"
                )

                .replace(
                  "a. m.",
                  "AM"
                );

            // 🔥 EJEMPLO:
            // 4/5/2026, 8:42:17 PM

            const partes =
              texto.split(",");

            const fechaPart =
              partes[0].trim();

            const horaPart =
              partes[1].trim();

            // 🔥 DD/MM/YYYY
            const [
              dia,
              mes,
              anio
            ] =
              fechaPart.split("/");

            // 🔥 FECHA MANUAL
            const fecha =
              new Date(

                Number(anio),

                Number(mes) - 1,

                Number(dia)

              );

            // 🔥 HORA
            const hora =
              new Date(
                `2000-01-01 ${horaPart}`
              );

            fecha.setHours(
              hora.getHours()
            );

            fecha.setMinutes(
              hora.getMinutes()
            );

            fecha.setSeconds(
              hora.getSeconds()
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
                  fecha.getTime()

              }

            );

            corregidas++;

          } catch (err) {

            console.log(err);

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
