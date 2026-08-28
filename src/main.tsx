import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Ghostwriter from "../ghostwriter";
import "./styles.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Ghostwriter />
  </StrictMode>
);
