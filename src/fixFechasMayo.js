import { db } from "./firebase";

import {

  collection,

  getDocs,

  doc,

  updateDoc

} from "firebase/firestore";

// 🚀 FIX FECHAS MAYO
export const fixFechasMayo =
  async () => {

    try {

      const ok = window.confirm(

        "⚠️ CORREGIR FECHAS\n\n" +

        "5/4/2026 → 4/5/2026\n\n" +

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

        if (
          typeof venta.fecha !==
          "number"
        ) continue;

        const fecha =
          new Date(venta.fecha);

        // 🔥 SI ES ABRIL 5
        if (

          fecha.getFullYear() === 2026 &&

          fecha.getMonth() === 3 &&

          fecha.getDate() === 5

        ) {

          // 🔥 CREAR MAYO 4
          const nueva =
            new Date(

              2026,

              4, // mayo

              4,

              fecha.getHours(),

              fecha.getMinutes(),

              fecha.getSeconds()

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
                "4/5/2026"

            }

          );

          corregidas++;
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
