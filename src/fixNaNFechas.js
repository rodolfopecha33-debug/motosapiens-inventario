import { db } from "./firebase";

import {

  collection,

  getDocs,

  doc,

  updateDoc

} from "firebase/firestore";

export const fixNaNFechas =
  async () => {

    try {

      const snap =
        await getDocs(
          collection(db, "ventas")
        );

      let corregidas = 0;

      for (const d of snap.docs) {

        const venta = d.data();

        console.log(
          "VENTA:",
          venta.fecha
        );

        // 🔥 DETECTAR NaN
        if (

          String(venta.fecha) ===
          "NaN"

        ) {

          try {

            const texto =
              venta.fechaTexto;

            if (!texto) continue;

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

            // 🔥 PARTES
            const partes =
              limpia.split(",");

            const fechaPart =
              partes[0].trim();

            const horaPart =
              partes[1].trim();

            // 🔥 FECHA
            const [

              dia,

              mes,

              anio

            ] =
              fechaPart.split("/");

            // 🔥 HORA
            let [

              horaTexto,

              minutos,

              segundosAMPM

            ] =
              horaPart.split(":");

            let segundos =
              segundosAMPM
                .slice(0,2);

            let ampm =
              segundosAMPM
                .slice(2)
                .trim();

            let hora =
              Number(horaTexto);

            // 🔥 PM
            if (

              ampm === "PM" &&

              hora !== 12

            ) {

              hora += 12;

            }

            // 🔥 AM
            if (

              ampm === "AM" &&

              hora === 12

            ) {

              hora = 0;

            }

            // 🔥 FECHA FINAL
            const fecha =
              new Date(

                Number(anio),

                Number(mes) - 1,

                Number(dia),

                hora,

                Number(minutos),

                Number(segundos)

              );

            const timestamp =
              fecha.getTime();

            console.log(
              "FIX:",
              timestamp
            );

            // 🚨 VALIDAR
            if (
              isNaN(timestamp)
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
                  timestamp

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
        "❌ Error"
      );

    }
};
