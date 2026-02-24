import { supabase } from "@lib/supabase";
import QRScanner from "@modules/pos/components/QRScanner";
import { usePOSStore } from "@store/usePOSStore";
import dayjs from "dayjs";

export default function POSPage() {
  const { cart, clear, addItem } = usePOSStore();

  const total = cart.reduce((sum, item) => {
    return sum + item.price * item.qty;
  }, 0);

  return (
    <div className="flex flex-col h-screen">
      {/* HEADER */}
      <header className="flex items-center justify-between px-6 text-white bg-gray-900 h-14">
        <div className="text-lg font-semibold">Deera ERP - POS</div>
        <div className="text-sm">{dayjs().format("DD MMM YYYY HH:mm")}</div>
      </header>

      {/* MAIN */}
      <div className="flex flex-1 overflow-hidden">
        {/* PRODUCT AREA */}
        <div className="flex-1 p-4 overflow-y-auto bg-white">
          <div className="mb-4">
            <QRScanner
              onScan={async (code) => {
                console.log("Scanned:", code);

                const { data, error } = await supabase
                  .from("products")
                  .select("*")
                  .eq("barcode_value", code)
                  .eq("is_active", true)
                  .single();

                if (error || !data) {
                  alert("Produk tidak ditemukan");
                  return;
                }

                addItem({
                  id: data.id,
                  name: data.product_code,
                  price: Number(data.selling_price),
                });
              }}
            />
          </div>

          <div className="grid grid-cols-5 gap-3">
            {[...Array(20)].map((_, i) => (
              <button
                key={i}
                onClick={() =>
                  addItem({
                    id: "P" + i,
                    name: "Produk " + (i + 1),
                    price: 10000,
                  })
                }
                className="h-20 text-sm font-medium transition bg-gray-100 rounded-lg active:scale-95 hover:bg-gray-200"
              >
                Produk {i + 1}
              </button>
            ))}
          </div>
        </div>

        {/* CART AREA */}
        <div className="w-[380px] bg-gray-50 border-l flex flex-col p-4">
          <div className="mb-4 text-xl font-semibold">Cart</div>

          <div className="flex-1 space-y-2 overflow-y-auto">
            {cart.map((item) => (
              <div
                key={item.id}
                className="flex justify-between p-3 text-sm bg-white rounded-lg shadow-sm"
              >
                <div>
                  <div className="font-medium">{item.name}</div>
                  <div className="text-gray-500">
                    {item.qty} x Rp {item.price.toLocaleString()}
                  </div>
                </div>
                <div className="font-semibold">
                  Rp {(item.price * item.qty).toLocaleString()}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 mt-4 text-2xl font-bold border-t">
            Total
            <div className="text-3xl text-green-600">
              Rp {total.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="flex h-16 bg-white border-t">
        <button
          onClick={clear}
          className="flex-1 text-lg font-semibold text-white bg-red-500 active:scale-95"
        >
          Clear
        </button>
        <button className="flex-1 text-lg font-semibold text-white bg-yellow-500 active:scale-95">
          Hold
        </button>
        <button className="flex-1 text-lg font-semibold text-white bg-green-600 active:scale-95">
          Bayar
        </button>
      </div>
    </div>
  );
}
