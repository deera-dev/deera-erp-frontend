import POSPage from "@modules/pos/POSPage";
import { createBrowserRouter } from "react-router-dom";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <POSPage />,
  },
]);
