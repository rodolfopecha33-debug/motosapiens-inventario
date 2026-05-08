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

          !venta.fecha ||

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

            // 🔥 DIVIDIR
            const partes =
              limpia.split(",");

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

            // 🔥 FECHA
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

            // 🔥 TIMESTAMP
            const timestamp =
              fecha.getTime();

            console.log(
              "FIX:",
              timestamp
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
