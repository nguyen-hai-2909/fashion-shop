import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthContextProvider } from "./context/AuthContext.jsx";
import { CartContextProvider } from "./context/CartContext.jsx";
import { DiscountContextProvider } from "./context/DiscountContext.jsx";
import { AdminContextProvider } from "./context/AdminContext.jsx";
import { GoogleOAuthProvider } from "@react-oauth/google";

const GOOGLE_CLIENT_ID =
  "519989747584-3fdbtvuthrkc3dg784k5dbkqjkmu0em4.apps.googleusercontent.com";

// import MessengerCustomerChat from "react-messenger-customer-chat";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
    <BrowserRouter>
      {/* <MessengerCustomerChat
        pageId="157771114084700"
        appId="1341663279776099"
      /> */}
      <AuthContextProvider>
        <CartContextProvider>
          <DiscountContextProvider>
            <AdminContextProvider>
              <ToastContainer
                theme="dark"
                position="bottom-center"
                autoClose={4000}
                newestOnTop
                limit={3}
                closeOnClick
                pauseOnHover
                draggable
                aria-live="assertive"
              />
              <App />
            </AdminContextProvider>
          </DiscountContextProvider>
        </CartContextProvider>
      </AuthContextProvider>
    </BrowserRouter>
    </GoogleOAuthProvider>
  </React.StrictMode>
);
