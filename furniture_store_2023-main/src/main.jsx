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
// import MessengerCustomerChat from "react-messenger-customer-chat";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
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
                position="top-right"
                autoClose={3000}
                closeOnClick
                pauseOnHover={false}
              />
              <App />
            </AdminContextProvider>
          </DiscountContextProvider>
        </CartContextProvider>
      </AuthContextProvider>
    </BrowserRouter>
  </React.StrictMode>
);
