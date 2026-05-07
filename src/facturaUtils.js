import jsPDF from "jspdf";

import autoTable from "jspdf-autotable";

// 🔥 GENERAR FACTURA
export const generarFacturaPDF = ({
  carrito,
  total,
  metodoPago,
  recibido,
  cambio,
  cliente,
  negocio
}) => {

  const doc = new jsPDF();


const logo = new Image();

logo.src = "/logo.png";

doc.addImage(
  logo,
  "PNG",
  150,
  10,
  40,
  20
);

  

  // 🔥 HEADER
  doc.setFontSize(20);

  doc.text(
    negocio?.nombre || "MOTOSAPIENS",
    14,
    20
  );

  doc.setFontSize(10);

  doc.text(
    negocio?.eslogan || "",
    14,
    28
  );

  doc.text(
    `Fecha: ${new Date().toLocaleString()}`,
    14,
    36
  );

  // 🔥 CLIENTE
  doc.setFontSize(12);

  doc.text(
    "DATOS CLIENTE",
    14,
    50
  );

  doc.setFontSize(10);

  doc.text(
    `Nombre: ${
      cliente?.nombre ||
      "Consumidor final"
    }`,
    14,
    58
  );

  doc.text(
    `Cédula: ${
      cliente?.cedula || "N/A"
    }`,
    14,
    64
  );

  doc.text(
    `Teléfono: ${
      cliente?.telefono || "N/A"
    }`,
    14,
    70
  );

  // 🔥 TABLA PRODUCTOS
  const rows = carrito.map((p) => [

    p.codigo || "N/A",

    p.nombre || "",

    p.cantidad || 0,

    `$${Number(
      p.venta || 0
    ).toLocaleString()}`,

    `$${(
      Number(p.venta || 0) *
      Number(p.cantidad || 0)
    ).toLocaleString()}`

  ]);

  // 🔥 TABLA
  autoTable(doc, {

    startY: 80,

    head: [[
      "Código",
      "Producto",
      "Cant",
      "Valor",
      "Subtotal"
    ]],

    body: rows

  });

  // 🔥 FINAL TABLA
  const finalY =
    doc.lastAutoTable.finalY + 10;

  // 🔥 TOTALES
  doc.setFontSize(12);

  doc.text(
    `TOTAL: $${total.toLocaleString()}`,
    14,
    finalY
  );

  doc.text(
    `Método pago: ${metodoPago}`,
    14,
    finalY + 8
  );

  // 🔥 EFECTIVO
  if (metodoPago === "efectivo") {

    doc.text(
      `Recibido: $${Number(
        recibido || 0
      ).toLocaleString()}`,
      14,
      finalY + 16
    );

    doc.text(
      `Cambio: $${Number(
        cambio || 0
      ).toLocaleString()}`,
      14,
      finalY + 24
    );
  }

  // 🔥 FOOTER
  doc.setFontSize(10);

  doc.text(
    "Gracias por su compra",
    14,
    finalY + 40
  );

  // 🔥 DESCARGAR
  doc.save(
    `Factura-${Date.now()}.pdf`
  );
};
