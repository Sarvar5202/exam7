import "./index.css";
import router from './router/router';
import { RouterProvider } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import NajotLoaderComponent from "./components/NajotLoader/NajotLoader";

export default function App() {
  return (
    <AppProvider>
      <NajotLoaderComponent />
      <RouterProvider router={router} />
    </AppProvider>
  );
}
