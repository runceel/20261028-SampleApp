import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Workspace from "./app/Workspace";
import "./shared/portal.css";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("The root element was not found.");
}

createRoot(rootElement).render(
  <StrictMode>
    <Workspace />
  </StrictMode>,
);
