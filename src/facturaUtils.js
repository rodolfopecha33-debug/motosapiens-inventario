import jsPDF from "jspdf";
      "Subtotal"
    ]],

    body: rows

  });

  const finalY = doc.lastAutoTable.finalY + 10;

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

  if (metodoPago === "efectivo") {

    doc.text(
      `Recibido: $${Number(recibido || 0).toLocaleString()}`,
      14,
      finalY + 16
    );

    doc.text(
      `Cambio: $${Number(cambio || 0).toLocaleString()}`,
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
