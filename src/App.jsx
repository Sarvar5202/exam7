import "./index.css";
import router from './router/router';
import { RouterProvider } from "react-router-dom";
import { AppProvider } from "./context/AppContext";

export default function App() {
  return (
    <AppProvider>
      <RouterProvider router={router} />
    </AppProvider>
  );
}
