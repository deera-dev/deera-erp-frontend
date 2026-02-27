// src/lib/printer.ts

import { baseConfig, mm, print } from "./tspl";

/* ============================= */
/* 🏷 BARCODE LABEL 40x30 mm     */
/* ============================= */

export function generateBarcodeLabel(product: {
  name: string;
  barcode: string;
  price?: number;
}) {
  let tspl = baseConfig(40, 30);

  tspl += `
TEXT ${mm(5)},${mm(3)},"2",0,1,1,"${product.name.slice(0, 20)}"
BARCODE ${mm(5)},${mm(10)},"128",${mm(8)},1,0,2,2,"${product.barcode}"
`;

  if (product.price) {
    tspl += `
TEXT ${mm(5)},${mm(22)},"2",0,1,1,"Rp ${product.price}"
`;
  }

  tspl += print(1);

  return tspl;
}

/* ============================= */
/* 🧾 RECEIPT 100mm Dynamic      */
/* ============================= */

export function generateTransactionLabel(data: {
  invoice: string;
  items: { name: string; qty: number; price: number }[];
  total: number;
}) {
  const baseHeightMm = 40; // header + footer
  const itemHeightMm = 8; // tinggi tiap item

  const totalHeightMm = baseHeightMm + data.items.length * itemHeightMm;

  let tspl = baseConfig(100, totalHeightMm);

  let y = mm(20);

  tspl += `
TEXT ${mm(30)},${mm(5)},"3",0,2,2,"DEERA STORE"
TEXT ${mm(5)},${mm(12)},"2",0,1,1,"Invoice: ${data.invoice}"
`;

  data.items.forEach((item) => {
    tspl += `
TEXT ${mm(5)},${y},"2",0,1,1,"${item.name.slice(0, 25)}"
TEXT ${mm(70)},${y},"2",0,1,1,"${item.qty}x"
TEXT ${mm(80)},${y},"2",0,1,1,"${item.price}"
`;
    y += mm(itemHeightMm);
  });

  tspl += `
TEXT ${mm(5)},${y + mm(5)},"3",0,1,1,"TOTAL:"
TEXT ${mm(80)},${y + mm(5)},"3",0,1,1,"${data.total}"
`;

  tspl += print(1);

  return tspl;
}
