// src/ConfirmModal.jsx
import React from "react";

export default function ConfirmModal({
  open,
  title = "Confirmación",
  message = "",
  total = 0,
  onConfirm,
  onCancel
}) {
  if (!open) return null;

  return (
    <div style={overlay}>
      <div style={modal}>
        <h2 style={{ marginBottom: 10 }}>⚠️ {title}</h2>

        <p style={{ marginBottom: 10 }}>{message}</p>

        {total > 0 && (
          <h3 style={{ marginBottom: 20 }}>
            Total: ${total}
          </h3>
        )}

        <div style={{ display: "flex", gap: 10 }}>
          <button style={btnCancel} onClick={onCancel}>
            ❌ Cancelar
          </button>

          <button style={btnOk} onClick={onConfirm}>
            ✅ Confirmar Venta
          </button>
        </div>
      </div>
    </div>
  );
}

const overlay = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  background: "rgba(0,0,0,0.7)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 999
};

const modal = {
  background: "#111",
  padding: "25px",
  borderRadius: "12px",
  color: "white",
  width: "320px",
  textAlign: "center"
};

const btnOk = {
  background: "#16b84e",
  color: "white",
  border: "none",
  padding: "12px",
  borderRadius: "8px",
  flex: 1,
  cursor: "pointer"
};

const btnCancel = {
  background: "#ff2a2a",
  color: "white",
  border: "none",
  padding: "12px",
  borderRadius: "8px",
  flex: 1,
  cursor: "pointer"
};
