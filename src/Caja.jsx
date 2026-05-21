import React, { useEffect, useState } from "react";
import { db } from "./firebase";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc
} from "firebase/firestore";

const parseFecha = (f) => {
  try {
    if (typeof f === "number") {
      return new Date(f);
    }

    if (f?.seconds) {
      return new Date(f.seconds * 1000);
    }

    if (typeof f === "string") {
      const limpia =
        f
          .replace("p. m.", "PM")
          .replace("a. m.", "AM")
          .trim();

      const [fechaPart, horaPart] = limpia.split(",");
      if (!fechaPart || !horaPart) return null;

      const partesFecha = fechaPart.trim().split("/");
      if (partesFecha.length !== 3) return null;

      const dia = Number(partesFecha[0]);
      const mes = Number(partesFecha[1]);
      const anio = Number(partesFecha[2]);
      const horaSplit = horaPart.trim().split(":");
      let hora = Number(horaSplit[0]);
      const minutos = Number(horaSplit[1]);
      const segundos = Number(horaSplit[2].slice(0, 2));
      const ampm = horaSplit[2].slice(2).trim();

      if (ampm === "PM" && hora !== 12) hora += 12;
      if (ampm === "AM" && hora === 12) hora = 0;

      return new Date(anio, mes - 1, dia, hora, minutos, segundos);
    }

    return null;
  } catch {
    return null;
  }
};

const defaultPendiente = {
  proveedor: "",
  descripcion: "",
  valor: "",
  fechaVence: ""
};

export default function Caja() {
  const [ventas, setVentas] = useState([]);
  const [pagosPendientes, setPagosPendientes] = useState([]);
  const [creditos, setCreditos] = useState([]);
  const [gastos, setGastos] =
  useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [nuevo, setNuevo] = useState(defaultPendiente);
  const [nuevoCredito, setNuevoCredito] = useState({
    tipo: "credito",
    titular: "",
    descripcion: "",
    valor: "",
    fechaVence: ""
  });
  const [filtro, setFiltro] = useState("mes");
  const [filtroCreditos, setFiltroCreditos] = useState("todos");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [soloProximos, setSoloProximos] = useState(false);

  useEffect(() => {
    cargarVentas();
    cargarPendientes();
    cargarCreditos();
    cargarGastos();
  }, []);

  const cargarVentas = async () => {
    try {
      const snap = await getDocs(collection(db, "ventas"));
      const datos = [];
      snap.forEach((docu) => datos.push({ id: docu.id, ...docu.data() }));
      setVentas(datos);
    } catch (error) {
      console.error(error);
    }
  };

  const cargarPendientes = async () => {
    try {
      const snap = await getDocs(collection(db, "pagosPendientes"));
      const datos = [];
      snap.forEach((docu) => datos.push({ id: docu.id, ...docu.data() }));
      setPagosPendientes(datos);
    } catch (error) {
      console.error(error);
    }
  };

  const cargarCreditos = async () => {
    try {
      const snap = await getDocs(collection(db, "creditos"));
      const datos = [];
      snap.forEach((docu) => datos.push({ id: docu.id, ...docu.data() }));
      setCreditos(datos);
    } catch (error) {
      console.error(error);
    }
  };


  const cargarGastos = async () => {

  try {

    const snap =
      await getDocs(
        collection(
          db,
          "gastos"
        )
      );

    const datos = [];

    snap.forEach((docu) =>
      datos.push({
        id: docu.id,
        ...docu.data()
      })
    );

    setGastos(datos);

  } catch (error) {

    console.error(error);

  }

};
  

  const ventasFiltradas = ventas.filter((v) => {
    if (!v.fecha) return false;
    const fecha = parseFecha(v.fecha);
    if (!fecha) return false;

    const ahora = new Date();
    if (fechaInicio && fechaFin) {
      const inicio = new Date(fechaInicio);
      const fin = new Date(fechaFin);
      fin.setHours(23, 59, 59, 999);
      return fecha >= inicio && fecha <= fin;
    }

    if (filtro === "hoy") {
      return fecha.toDateString() === ahora.toDateString();
    }

    if (filtro === "semana") {
      const hace7 = new Date();
      hace7.setDate(ahora.getDate() - 7);
      return fecha >= hace7;
    }

    if (filtro === "mes") {
      return (
        fecha.getMonth() === ahora.getMonth() &&
        fecha.getFullYear() === ahora.getFullYear()
      );
    }

    if (filtro === "año") {
      return fecha.getFullYear() === ahora.getFullYear();
    }

    return true;
  });

  const cajaEfectivo = ventasFiltradas.reduce(
    (sum, v) =>
      sum +
      (v.metodoPago === "efectivo" ? Number(v.total || 0) : 0),
    0
  );

  const totalIngresos = ventasFiltradas.reduce(
    (sum, v) => sum + Number(v.total || 0),
    0
  );

  const totalCosto = ventasFiltradas.reduce(
    (sum, v) =>
      sum +
      (v.productos || []).reduce(
        (sub, p) => sub + Number(p.compra || 0) * Number(p.cantidad || 0),
        0
      ),
    0
  );

  const totalGanancia = totalIngresos - totalCosto;
  const totalGastos =
  gastos.reduce(

    (sum, g)=>

      sum +
      Number(
        g.valor || 0
      ),

    0

  );
  const margenUtilidad =
    totalIngresos > 0
      ? Math.round((totalGanancia / totalIngresos) * 100)
      : 0;

  const pendientesFiltrados = pagosPendientes.filter((p) => {
    const proveedor = String(p.proveedor || "").toLowerCase();
    const descripcion = String(p.descripcion || "").toLowerCase();
    return (
      proveedor.includes(busqueda.toLowerCase()) ||
      descripcion.includes(busqueda.toLowerCase())
    );
  });

  const calcularDiasParaVencer = (valor) => {
    if (!valor) return null;
    let fecha;

    if (typeof valor === "object" && valor?.seconds) {
      fecha = new Date(valor.seconds * 1000);
    } else {
      fecha = new Date(valor);
    }

    if (Number.isNaN(fecha.getTime())) {
      const partes = String(valor).split("/");
      if (partes.length === 3) {
        const [dia, mes, anio] = partes.map((p) => Number(p));
        fecha = new Date(anio, mes - 1, dia);
      }
    }

    if (Number.isNaN(fecha.getTime())) return null;

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const destino = new Date(fecha);
    destino.setHours(0, 0, 0, 0);

    const diff = destino.getTime() - hoy.getTime();
    return Math.round(diff / (1000 * 60 * 60 * 24));
  };

  const creditosFiltrados = creditos.filter((c) => {
    const texto = `${c.titular || ""} ${c.descripcion || ""}`.toLowerCase();
    const cumpleBusqueda = texto.includes(busqueda.toLowerCase());
    if (!cumpleBusqueda) return false;

    if (filtroCreditos === "creditos") return c.tipo === "credito";
    if (filtroCreditos === "tarjetas") return c.tipo === "tarjeta";
    if (filtroCreditos === "vencidos") {
      const dias = calcularDiasParaVencer(c.fechaVence);
      return dias !== null && dias < 0;
    }

    return true;
  });

  const creditosActivos = creditosFiltrados.filter((c) => c.tipo === "credito");
  const tarjetasActivas = creditosFiltrados.filter((c) => c.tipo === "tarjeta");

  const totalCreditos = creditosActivos.reduce(
    (sum, c) => sum + Number(c.valor || 0),
    0
  );

  const totalTarjetas = tarjetasActivas.reduce(
    (sum, c) => sum + Number(c.valor || 0),
    0
  );

  const proximosVencimientos = pendientesFiltrados.filter((p) => {
    const dias = calcularDiasParaVencer(p.fechaVence);
    return dias !== null && dias >= 0 && dias <= 7;
  });

  const proximosVencimientosCreditos = creditosFiltrados.filter((c) => {
    const dias = calcularDiasParaVencer(c.fechaVence);
    return dias !== null && dias >= 0 && dias <= 7;
  });

  const pagosVisibles = soloProximos ? proximosVencimientos : pendientesFiltrados;

  const deudaTotal = pagosVisibles.reduce(
    (sum, p) => sum + Number(p.valor || 0),
    0
  );

  const totalProximos = proximosVencimientos.reduce(
    (sum, p) => sum + Number(p.valor || 0),
    0
  );

  const totalProximosCreditos = proximosVencimientosCreditos.reduce(
    (sum, c) => sum + Number(c.valor || 0),
    0
  );

  const agregarPendiente = async () => {
    if (!nuevo.proveedor || !nuevo.valor) {
      alert("Proveedor y valor son obligatorios.");
      return;
    }

    try {
      await addDoc(collection(db, "pagosPendientes"), {
        proveedor: nuevo.proveedor,
        descripcion: nuevo.descripcion,
        valor: Number(nuevo.valor),
        fechaVence: nuevo.fechaVence || null,
        estado: "pendiente",
        creado: Date.now()
      });
      setNuevo(defaultPendiente);
      cargarPendientes();
    } catch (error) {
      console.error(error);
    }
  };

  const agregarCredito = async () => {
    if (!nuevoCredito.titular || !nuevoCredito.valor) {
      alert("Titular y valor son obligatorios.");
      return;
    }

    try {
      await addDoc(collection(db, "creditos"), {
        tipo: nuevoCredito.tipo,
        titular: nuevoCredito.titular,
        descripcion: nuevoCredito.descripcion,
        valor: Number(nuevoCredito.valor),
        fechaVence: nuevoCredito.fechaVence || null,
        estado: "pendiente",
        creado: Date.now()
      });
      setNuevoCredito({
        tipo: "credito",
        titular: "",
        descripcion: "",
        valor: "",
        fechaVence: ""
      });
      cargarCreditos();
    } catch (error) {
      console.error(error);
    }
  };

  const marcarCreditoPagado = async (item) => {
    try {
      await updateDoc(doc(db, "creditos", item.id), {
        estado: item.estado === "pagado" ? "pendiente" : "pagado"
      });
      cargarCreditos();
    } catch (error) {
      console.error(error);
    }
  };

  const eliminarCredito = async (item) => {
    const confirmar = window.confirm(
      `Eliminar ${item.tipo} de ${item.titular || "titular"} por $${Number(item.valor || 0).toLocaleString()}?`
    );
    if (!confirmar) return;

    try {
      await deleteDoc(doc(db, "creditos", item.id));
      cargarCreditos();
    } catch (error) {
      console.error(error);
    }
  };

  const marcarPagado = async (item) => {
    try {
      await updateDoc(doc(db, "pagosPendientes", item.id), {
        estado: item.estado === "pagado" ? "pendiente" : "pagado"
      });
      cargarPendientes();
    } catch (error) {
      console.error(error);
    }
  };

  const eliminarPendiente = async (item) => {
    const confirmar = window.confirm(
      `Eliminar pago pendiente de ${item.proveedor || "Proveedor"} por $${Number(item.valor || 0).toLocaleString()}?`
    );
    if (!confirmar) return;

    try {
      await deleteDoc(doc(db, "pagosPendientes", item.id));
      cargarPendientes();
    } catch (error) {
      console.error(error);
    }
  };

  const formatearFecha = (valor) => {
    if (!valor) return "-";
    let fecha;

    if (typeof valor === "object" && valor?.seconds) {
      fecha = new Date(valor.seconds * 1000);
    } else {
      fecha = new Date(valor);
    }

    if (Number.isNaN(fecha.getTime())) {
      const partes = String(valor).split("/");
      if (partes.length === 3) {
        const [dia, mes, anio] = partes.map((p) => Number(p));
        fecha = new Date(anio, mes - 1, dia);
      }
    }

    return Number.isNaN(fecha.getTime())
      ? "-"
      : fecha.toLocaleDateString("es-CO");
  };

  return (
    <div style={{ padding: 25, color: "white" }}>
      <h1>💼 Caja y Finanzas</h1>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button style={buttonStyle()} onClick={() => setFiltro("hoy")}>Hoy</button>
        <button style={buttonStyle()} onClick={() => setFiltro("semana")}>Semana</button>
        <button style={buttonStyle()} onClick={() => setFiltro("mes")}>Mes</button>
        <button style={buttonStyle()} onClick={() => setFiltro("año")}>Año</button>
      </div>

      <div style={{ marginTop: 15, display: "flex", gap: 10, flexWrap: "wrap" }}>
        <input
          type="date"
          value={fechaInicio}
          onChange={(e) => setFechaInicio(e.target.value)}
        />
        <input
          type="date"
          value={fechaFin}
          onChange={(e) => setFechaFin(e.target.value)}
        />
        <button style={buttonStyle()} onClick={() => { setFechaInicio(""); setFechaFin(""); }}>
          Limpiar
        </button>
      </div>

      <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", marginTop: 25 }}>
        <SummaryCard titulo="💵 Caja Efectivo" valor={`$${cajaEfectivo.toLocaleString()}`} />
        <SummaryCard titulo="📈 Ingresos" valor={`$${totalIngresos.toLocaleString()}`} />
        <SummaryCard titulo="📉 Costo" valor={`$${totalCosto.toLocaleString()}`} />
        <SummaryCard titulo="📊 Ganancia" valor={`$${totalGanancia.toLocaleString()}`} />
        <SummaryCard titulo="📦 Margen" valor={`${margenUtilidad}%`} />
        <SummaryCard titulo="⏳ Pendiente" valor={`$${deudaTotal.toLocaleString()}`} />
        <SummaryCard titulo="💳 Créditos" valor={`$${totalCreditos.toLocaleString()}`} />
        <SummaryCard titulo="🏦 Tarjetas" valor={`$${totalTarjetas.toLocaleString()}`} />
        <SummaryCard titulo="⚠️ Próximos vencimientos" valor={`${proximosVencimientos.length + proximosVencimientosCreditos.length} pagos`} />
      </div>
      {proximosVencimientos.length > 0 && (
        <div style={{ marginTop: 20, background: "#1a1a1a", border: "1px solid #444", padding: 18, borderRadius: 16 }}>
          <h3 style={{ margin: 0, marginBottom: 10 }}>⏰ Recordatorio de vencimientos próximos</h3>
          <p style={{ margin: 0 }}>
            Tienes {proximosVencimientos.length} pago(s) a vencer en los próximos 7 días por un total de ${totalProximos.toLocaleString()}.
          </p>
        </div>
      )}

      <div style={{ marginTop: 30, display: "grid", gap: 20 }}>
        <div style={{ background: "#111", padding: 20, borderRadius: 16, border: "1px solid #222" }}>
          <h2 style={{ marginBottom: 12 }}>📌 Pagos pendientes a proveedores</h2>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 16 }}>
            <input
              placeholder="Proveedor"
              value={nuevo.proveedor}
              onChange={(e) => setNuevo({ ...nuevo, proveedor: e.target.value })}
              style={inputStyle()}
            />
            <input
              placeholder="Descripción"
              value={nuevo.descripcion}
              onChange={(e) => setNuevo({ ...nuevo, descripcion: e.target.value })}
              style={inputStyle()}
            />
            <input
              type="number"
              placeholder="Valor"
              value={nuevo.valor}
              onChange={(e) => setNuevo({ ...nuevo, valor: e.target.value })}
              style={inputStyle()}
            />
            <input
              type="date"
              value={nuevo.fechaVence}
              onChange={(e) => setNuevo({ ...nuevo, fechaVence: e.target.value })}
              style={inputStyle()}
            />
            <button style={buttonStyle()} onClick={agregarPendiente}>Agregar</button>
          </div>

          <input
            placeholder="Buscar proveedor o descripción"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            style={{ ...inputStyle(), width: "100%", marginBottom: 16 }}
          />
          <button
            style={{
              ...buttonStyle(),
              background: soloProximos ? "#e0a800" : "#1a73e8",
              marginBottom: 16
            }}
            onClick={() => setSoloProximos(!soloProximos)}
          >
            {soloProximos ? "Mostrar todos" : "Solo próximos a vencer"}
          </button>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ color: "#bbb", textAlign: "left", borderBottom: "1px solid #222" }}>
                  <th style={tdHead()}>Proveedor</th>
                  <th style={tdHead()}>Valor</th>
                  <th style={tdHead()}>Vence</th>
                  <th style={tdHead()}>Estado</th>
                  <th style={tdHead()}>Acción</th>
                </tr>
              </thead>
              <tbody>
                {pagosVisibles.map((item) => {
                  const dias = calcularDiasParaVencer(item.fechaVence);
                  return (
                    <tr
                      key={item.id}
                      style={{
                        borderBottom: "1px solid #222",
                        background:
                          dias !== null && dias >= 0 && dias <= 7
                            ? "rgba(255, 209, 102, 0.12)"
                            : dias !== null && dias < 0
                            ? "rgba(255, 107, 107, 0.12)"
                            : "transparent"
                      }}
                    >
                      <td style={tdBody()}>{item.proveedor}</td>
                      <td style={tdBody()}>{`$${Number(item.valor || 0).toLocaleString()}`}</td>
                      <td style={tdBody()}>
                        {formatearFecha(item.fechaVence)}
                        {dias === null ? null : dias < 0 ? (
                          <span style={{ color: "#ff6b6b", marginLeft: 8 }}>(Vencido)</span>
                        ) : dias <= 7 ? (
                          <span style={{ color: "#ffd166", marginLeft: 8 }}>(en {dias} días)</span>
                        ) : null}
                      </td>
                      <td style={tdBody()}>{item.estado || "pendiente"}</td>
                      <td style={tdBody()}>
                        <button style={smallBtn(item.estado === "pagado")} onClick={() => marcarPagado(item)}>
                          {item.estado === "pagado" ? "Reabrir" : "Marcar pagado"}
                        </button>
                        <button
                          style={{
                            marginLeft: 8,
                            background: "#e03d3d",
                            color: "white",
                            border: "none",
                            padding: "8px 12px",
                            borderRadius: "8px",
                            cursor: "pointer"
                          }}
                          onClick={() => eliminarPendiente(item)}
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div style={{ background: "#111", padding: 20, borderRadius: 16, border: "1px solid #222" }}>
          <h2 style={{ marginBottom: 12 }}>💳 Créditos y tarjetas de crédito</h2>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 16 }}>
            <button
              style={{ ...buttonStyle(), background: filtroCreditos === "todos" ? "#1a73e8" : "#444" }}
              onClick={() => setFiltroCreditos("todos")}
            >
              Todos
            </button>
            <button
              style={{ ...buttonStyle(), background: filtroCreditos === "creditos" ? "#1a73e8" : "#444" }}
              onClick={() => setFiltroCreditos("creditos")}
            >
              Créditos
            </button>
            <button
              style={{ ...buttonStyle(), background: filtroCreditos === "tarjetas" ? "#1a73e8" : "#444" }}
              onClick={() => setFiltroCreditos("tarjetas")}
            >
              Tarjetas
            </button>
            <button
              style={{ ...buttonStyle(), background: filtroCreditos === "vencidos" ? "#1a73e8" : "#444" }}
              onClick={() => setFiltroCreditos("vencidos")}
            >
              Vencidos
            </button>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 16 }}>
            <select
              value={nuevoCredito.tipo}
              onChange={(e) => setNuevoCredito({ ...nuevoCredito, tipo: e.target.value })}
              style={inputStyle()}
            >
              <option value="credito">Crédito</option>
              <option value="tarjeta">Tarjeta</option>
            </select>
            <input
              placeholder="Titular / Emisor"
              value={nuevoCredito.titular}
              onChange={(e) => setNuevoCredito({ ...nuevoCredito, titular: e.target.value })}
              style={inputStyle()}
            />
            <input
              placeholder="Descripción"
              value={nuevoCredito.descripcion}
              onChange={(e) => setNuevoCredito({ ...nuevoCredito, descripcion: e.target.value })}
              style={inputStyle()}
            />
            <input
              type="number"
              placeholder="Valor"
              value={nuevoCredito.valor}
              onChange={(e) => setNuevoCredito({ ...nuevoCredito, valor: e.target.value })}
              style={inputStyle()}
            />
            <input
              type="date"
              value={nuevoCredito.fechaVence}
              onChange={(e) => setNuevoCredito({ ...nuevoCredito, fechaVence: e.target.value })}
              style={inputStyle()}
            />
            <button style={buttonStyle()} onClick={agregarCredito}>Agregar</button>
          </div>

          <div style={{ overflowX: "auto", marginBottom: 16 }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ color: "#bbb", textAlign: "left", borderBottom: "1px solid #222" }}>
                  <th style={tdHead()}>Tipo</th>
                  <th style={tdHead()}>Titular</th>
                  <th style={tdHead()}>Valor</th>
                  <th style={tdHead()}>Vence</th>
                  <th style={tdHead()}>Estado</th>
                  <th style={tdHead()}>Acción</th>
                </tr>
              </thead>
              <tbody>
                {creditosFiltrados.map((item) => {
                  const dias = calcularDiasParaVencer(item.fechaVence);
                  return (
                    <tr
                      key={item.id}
                      style={{
                        borderBottom: "1px solid #222",
                        background:
                          dias !== null && dias >= 0 && dias <= 7
                            ? "rgba(255, 209, 102, 0.12)"
                            : dias !== null && dias < 0
                            ? "rgba(255, 107, 107, 0.12)"
                            : "transparent"
                      }}
                    >
                      <td style={tdBody()}>{item.tipo === "tarjeta" ? "Tarjeta" : "Crédito"}</td>
                      <td style={tdBody()}>{item.titular}</td>
                      <td style={tdBody()}>{`$${Number(item.valor || 0).toLocaleString()}`}</td>
                      <td style={tdBody()}>
                        {formatearFecha(item.fechaVence)}
                        {dias === null ? null : dias < 0 ? (
                          <span style={{ color: "#ff6b6b", marginLeft: 8 }}>(Vencido)</span>
                        ) : dias <= 7 ? (
                          <span style={{ color: "#ffd166", marginLeft: 8 }}>(en {dias} días)</span>
                        ) : null}
                      </td>
                      <td style={tdBody()}>{item.estado || "pendiente"}</td>
                      <td style={tdBody()}>
                        <button style={smallBtn(item.estado === "pagado")} onClick={() => marcarCreditoPagado(item)}>
                          {item.estado === "pagado" ? "Reabrir" : "Marcar pagado"}
                        </button>
                        <button
                          style={{
                            marginLeft: 8,
                            background: "#e03d3d",
                            color: "white",
                            border: "none",
                            padding: "8px 12px",
                            borderRadius: "8px",
                            cursor: "pointer"
                          }}
                          onClick={() => eliminarCredito(item)}
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div style={{ background: "#111", padding: 20, borderRadius: 16, border: "1px solid #222" }}>
          <h2 style={{ marginBottom: 12 }}>🧾 Resumen de ventas</h2>
          <p style={{ margin: 0 }}>Ventas filtradas: {ventasFiltradas.length}</p>
          <p style={{ margin: 0 }}>Total productos vendidos: {(ventasFiltradas || []).reduce((sum, v) => sum + (v.productos || []).reduce((sub, p) => sub + Number(p.cantidad || 0), 0), 0)}</p>
          <p style={{ margin: 0 }}>Total efectivo en caja: ${cajaEfectivo.toLocaleString()}</p>
          <p style={{ margin: 0 }}>Total por cobrar / pendiente: ${deudaTotal.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ titulo, valor }) {
  return (
    <div style={{ background: "#111", padding: 20, borderRadius: 16, border: "1px solid #222" }}>
      <h3 style={{ marginBottom: 8 }}>{titulo}</h3>
      <div style={{ fontSize: 26, fontWeight: "bold" }}>{valor}</div>
    </div>
  );
}

function buttonStyle() {
  return {
    background: "#16b84e",
    color: "white",
    border: "none",
    padding: "10px 16px",
    borderRadius: "8px",
    cursor: "pointer"
  };
}

function smallBtn(isPagado) {
  return {
    background: isPagado ? "#444" : "#1a73e8",
    color: "white",
    border: "none",
    padding: "8px 12px",
    borderRadius: "8px",
    cursor: "pointer"
  };
}

function inputStyle() {
  return {
    background: "#222",
    border: "1px solid #333",
    borderRadius: 10,
    color: "white",
    padding: "10px 14px",
    minWidth: 180
  };
}

function tdHead() {
  return {
    padding: "12px 10px",
    fontSize: 14,
    textTransform: "uppercase",
    letterSpacing: "0.02em"
  };
}

function tdBody() {
  return {
    padding: "12px 10px",
    color: "#ddd"
  };
}
