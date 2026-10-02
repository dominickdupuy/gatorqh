
  import { createRoot } from "react-dom/client";
  import App from "./app/App.tsx";
  import { applyPowerClass } from "./app/performance";
  import "./styles/index.css";

  applyPowerClass();

  createRoot(document.getElementById("root")!).render(<App />);
  