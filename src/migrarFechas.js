import { db } from "./firebase";

import {

  collection,

  getDocs,

  doc,

  updateDoc

} from "firebase/firestore";

export const migrarFechas =
  async () => {

    try {

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

        // 🔥 OBLIGAR STRING
        const fechaOriginal =
          String(
            venta.fecha || ""
          );

        // 🔥 SI YA ES TIMESTAMP
        if (

          !fechaOriginal.includes("/")

        ) {

          continue;

        }

        try {

          // 🔥 EJEMPLO:
          // 4/5/2026, 9:12:03 p. m.

          const limpia =
            fechaOriginal

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

          const fechaTexto =
            partes[0].trim();

          const hora =
            partes[1]?.trim() ||
            "12:00 AM";

          // 🔥 DIVIDIR
          const [
            dia,
            mes,
            anio
          ] =
            fechaTexto.split("/");

          // 🚀 FECHA MANUAL
          const fecha =
            new Date(

              Number(anio),

              Number(mes) - 1,

              Number(dia)

            );

          // 🔥 HORA
          const horaDate =
            new Date(
              `2000-01-01 ${hora}`
            );

          fecha.setHours(
            horaDate.getHours()
          );

          fecha.setMinutes(
            horaDate.getMinutes()
          );

          fecha.setSeconds(
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
                fecha.getTime(),

              fechaTexto:
                fechaOriginal

            }

          );

          migradas++;

        } catch (err) {

          console.log(err);

        }
      }

      alert(

        `✅ Migradas: ${migradas}`

      );

    } catch (error) {

      console.error(error);

      alert(
        "❌ Error migrando"
      );

    }
};
