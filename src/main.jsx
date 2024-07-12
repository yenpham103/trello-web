import React from "react";
import ReactDOM from "react-dom/client";
import App from "~/App.jsx";
import theme from "~/theme";
import CssBaseline from "@mui/material/CssBaseline";
import { Experimental_CssVarsProvider as CssVarsProvider } from "@mui/material/styles";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
//mui dialog
import { ConfirmProvider } from "material-ui-confirm";

ReactDOM.createRoot(document.getElementById("root")).render(
  // <React.StrictMode>
  <CssVarsProvider theme={theme}>
    <ConfirmProvider
      defaultOptions={{
        dialogProps: { maxWidth: "xs" },
        allowClose: false,
      }}
    >
      <CssBaseline />
      <App />
      <ToastContainer position="bottom-right" />
    </ConfirmProvider>
  </CssVarsProvider>
  // </React.StrictMode>
);
