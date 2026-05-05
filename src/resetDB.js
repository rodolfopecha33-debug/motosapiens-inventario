import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "./firebase";

// 🔥 BORRAR VENTAS + MOVIMIENTOS
export const resetVentas = async () => {
  if (!window.confirm("⚠️ Esto borrará TODAS las ventas. ¿Continuar?")) {
    return;
  }

  try {
    // 🔴 BORRAR VENTAS
    const ventasSnap = await getDocs(collection(db, "ventas"));

    for (const d of ventasSnap.docs) {
      await deleteDoc(doc(db, "ventas", d.id));
    }

    // 🔴 BORRAR MOVIMIENTOS
    const movSnap = await getDocs(collection(db, "movimientos"));

    for (const d of movSnap.docs) {
      await deleteDoc(doc(db, "movimientos", d.id));
    }

    alert("✅ Ventas y movimientos eliminados correctamente");
  } catch (error) {
    console.error(error);
    alert("❌ Error al eliminar datos");
  }
};
