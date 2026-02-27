import { generateTransactionLabel } from "@lib/printer";
import { sendToRawBT } from "@lib/rawBT";
import { supabase } from "@lib/supabase";
import { useEffect, useRef, useState } from "react";

type CartItem = {
  id: string;
  name: string;
  barcode: string;
  price: number;
  qty: number;
};

export default function POSPage() {
  const [barcodeInput, setBarcodeInput] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const barcodeRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    barcodeRef.current?.focus();
  }, []);

  /* ============================= */
  /* 🔍 FETCH PRODUCT FROM DB     */
  /* ============================= */
  const handleAddProduct = async () => {
    if (!barcodeInput) return;

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("barcode", barcodeInput)
      .single();

    if (error || !data) {
      alert("Produk tidak ditemukan");
      return;
    }

    setCart((prev) => {
      const existing = prev.find((p) => p.id === data.id);

      if (existing) {
        return prev.map((p) =>
          p.id === data.id ? { ...p, qty: p.qty + 1 } : p,
        );
      }

      return [
        ...prev,
        {
          id: data.id,
          name: data.name,
          barcode: data.barcode,
          price: data.price,
          qty: 1,
        },
      ];
    });

    setBarcodeInput("");
  };

  /* ============================= */
  /* 💰 TOTAL                     */
  /* ============================= */
  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  const change = paidAmount - total;

  /* ============================= */
  /* 💾 SAVE TRANSACTION          */
  /* ============================= */
  const handleCheckout = async () => {
    if (cart.length === 0) return;
    if (paidAmount < total) {
      alert("Pembayaran kurang");
      return;
    }

    try {
      setLoading(true);

      const invoice = "INV-" + Date.now();

      // 1️⃣ Insert sale
      const { data: sale, error: saleError } = await supabase
        .from("sales")
        .insert({
          invoice,
          total,
          paid: paidAmount,
          change,
        })
        .select()
        .single();

      if (saleError) throw saleError;

      // 2️⃣ Insert sale items
      const saleItems = cart.map((item) => ({
        sale_id: sale.id,
        product_id: item.id,
        name: item.name,
        price: item.price,
        qty: item.qty,
      }));

      const { error: itemsError } = await supabase
        .from("sale_items")
        .insert(saleItems);

      if (itemsError) throw itemsError;

      // 3️⃣ Print
      const tspl = generateTransactionLabel({
        invoice,
        items: cart,
        total,
      });

      sendToRawBT(tspl, "receipt.txt");

      // 4️⃣ Reset
      setCart([]);
      setPaidAmount(0);
      alert("Transaksi berhasil!");
    } catch (err) {
      console.error(err);
      alert("Gagal menyimpan transaksi");
    } finally {
      setLoading(false);
    }
  };

  /* ============================= */
  /* 🧾 UI                        */
  /* ============================= */
  return (
    <div style={{ padding: 20 }}>
      <h2>DEERA POS</h2>

      {/* Barcode */}
      <input
        ref={barcodeRef}
        value={barcodeInput}
        onChange={(e) => setBarcodeInput(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleAddProduct()}
        placeholder="Scan barcode"
        style={{ padding: 10, width: 300 }}
      />

      {/* Cart */}
      <table width="100%" border={1} cellPadding={8} style={{ marginTop: 20 }}>
        <thead>
          <tr>
            <th>Produk</th>
            <th>Harga</th>
            <th>Qty</th>
            <th>Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {cart.map((item) => (
            <tr key={item.id}>
              <td>{item.name}</td>
              <td>Rp {item.price}</td>
              <td>{item.qty}</td>
              <td>Rp {item.price * item.qty}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Payment */}
      <div style={{ marginTop: 20 }}>
        <h3>Total: Rp {total}</h3>

        <input
          type="number"
          placeholder="Uang dibayar"
          value={paidAmount}
          onChange={(e) => setPaidAmount(Number(e.target.value))}
          style={{ padding: 10, width: 200 }}
        />

        <h3>Kembalian: Rp {change > 0 ? change : 0}</h3>
      </div>

      {/* Checkout */}
      <button
        onClick={handleCheckout}
        disabled={loading}
        style={{
          marginTop: 20,
          padding: "10px 20px",
          fontSize: 16,
        }}
      >
        {loading ? "Processing..." : "💳 Checkout & Print"}
      </button>
    </div>
  );
}
