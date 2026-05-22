import { Route, Routes } from "react-router-dom";
import HomePage from "../pages/HomePage/HomePage";
import AboutPage from "../pages/AboutPage/AboutPage";
import ContactPage from "../pages/ContactPage/ContactPage";
import ProductsPage from "../pages/ProductPage/ProductsPage";
import ProductDetailPage from "../pages/ProductPage/ProductDetailPage";
import Login from "../pages/AuthPage/LoginPage/Login";
import Signup from "../pages/AuthPage/Signup/Signup";
import ProtectedRoute from "./ProtectedRoute";
import ProfilePage from "../pages/ProfilePage/ProfilePage";
import ForgotPassword from "../pages/AuthPage/ForgotPassword/ForgotPassword";
import CartPage from "../pages/CartPage/CartPage";
import CheckoutPage from "../pages/CheckoutPage/CheckoutPage";
import Layout from "../layout/Layout";
import LoginAdmin from "../pages/AuthPage/LoginPage/LoginAdmin";
import LayoutAdmin from "../layout/LayoutAdmin";
import Dashboard from "../pages/AdminPage/Dashboard/Dashboard";
import Order from "../pages/AdminPage/Order/Order";
import User from "../pages/AdminPage/User/User";
import Product from "../pages/AdminPage/Product/Product";
import NotExistedPage from "../pages/NotExistedPage/NotExistedPage";
import ProtectedRouteAdmin from "./ProtectedRouteAdmin";
import CheckoutSuccess from "../components/CheckoutSuccess/CheckoutSuccess";
import UserAccount from "../components/UserAccount/UserAccount";
import OrderAccount from "../components/OrderAccount/OrderAccount";
import OrderAccountDetail from "../components/OrderAccount/OrderAccountDetail/OrderAccountDetail";
import ProductForm from "../pages/AdminPage/Product/ProductForm/ProductForm";
import Analytic from "../pages/AdminPage/Analytic/Analytic";
import OrderDetail from "../pages/AdminPage/Order/OrderDetail/OrderDetail";
import Discount from "../pages/AdminPage/Discount/Discount";
import ForgotPasswordPage from "../pages/ForgotPasswordPage/ForgotPasswordPage";
import Category from "../pages/AdminPage/Category/Category";
import Review from "../pages/AdminPage/Review/Review";
import Staff from "../pages/AdminPage/Staff/Staff";
import OrderReviewPage from "../pages/OrderReviewPage/OrderReviewPage";
import OrderReviewHubPage from "../pages/OrderReviewPage/OrderReviewHubPage";
import AdminRoleRoute from "./AdminRoleRoute";

const Routers = () => {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <Layout isLayout={true}>
            <HomePage />
          </Layout>
        }
      />
      <Route
        path="/about"
        element={
          <Layout isLayout={true}>
            <AboutPage />
          </Layout>
        }
      />
      <Route
        path="/contact"
        element={
          <Layout isLayout={true}>
            <ContactPage />
          </Layout>
        }
      />
      <Route
        path="/products"
        element={
          <Layout isLayout={true}>
            <ProductsPage />
          </Layout>
        }
      />
      <Route
        path="/products/:identifier"
        element={
          <Layout isLayout={true}>
            <ProductDetailPage />
          </Layout>
        }
      />
      <Route
        path="/login"
        element={
          <Layout isLayout={true}>
            <Login />
          </Layout>
        }
      />
      <Route
        path="/signup"
        element={
          <Layout isLayout={true}>
            <Signup />
          </Layout>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <Layout isLayout={true}>
            <ForgotPassword />
          </Layout>
        }
      />
      <Route
        path="/cart"
        element={
          <Layout isLayout={true}>
            <CartPage />
          </Layout>
        }
      />
      <Route
        path="/checkout"
        element={
          <ProtectedRoute>
            <Layout>
              <CheckoutPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/user/me"
        element={
          <ProtectedRoute>
            <Layout isLayout={true}>
              <ProfilePage>
                <UserAccount />
              </ProfilePage>
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/user/order"
        element={
          <ProtectedRoute>
            <Layout isLayout={true}>
              <ProfilePage>
                <OrderAccount />
              </ProfilePage>
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/reset-password"
        element={
          <Layout isLayout={true}>
            <ForgotPasswordPage />
          </Layout>
        }
      />
      <Route
        path="/user/order/:id"
        element={
          <ProtectedRoute>
            <Layout isLayout={true}>
              <ProfilePage>
                <OrderAccountDetail />
              </ProfilePage>
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/checkout/success/:id"
        element={
          <Layout>
            <CheckoutSuccess />
          </Layout>
        }
      />
      <Route
        path="/order/:orderId/review"
        element={
          <ProtectedRoute>
            <Layout isLayout={true}>
              <OrderReviewHubPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/order/:orderId/review/:itemIndex"
        element={
          <ProtectedRoute>
            <Layout isLayout={true}>
              <OrderReviewPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/login"
        element={
          // <Layout>
            <LoginAdmin />
          // </Layout>
        }
      />
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRouteAdmin>
            <LayoutAdmin>
              <AdminRoleRoute pageKey="dashboard">
                <Dashboard />
              </AdminRoleRoute>
            </LayoutAdmin>
          </ProtectedRouteAdmin>
        }
      />
      <Route
        path="/admin/analytic"
        element={
          <ProtectedRouteAdmin>
            <LayoutAdmin>
              <AdminRoleRoute pageKey="analytic">
                <Analytic />
              </AdminRoleRoute>
            </LayoutAdmin>
          </ProtectedRouteAdmin>
        }
      />
      <Route
        path="/admin/product"
        element={
          <ProtectedRouteAdmin>
            <LayoutAdmin>
              <AdminRoleRoute pageKey="product">
                <Product />
              </AdminRoleRoute>
            </LayoutAdmin>
          </ProtectedRouteAdmin>
        }
      />
      <Route
        path="/admin/product/create"
        element={
          <ProtectedRouteAdmin>
            <LayoutAdmin>
              <AdminRoleRoute pageKey="product">
                <ProductForm />
              </AdminRoleRoute>
            </LayoutAdmin>
          </ProtectedRouteAdmin>
        }
      />
      <Route
        path="/admin/product/:id"
        element={
          <ProtectedRouteAdmin>
            <LayoutAdmin>
              <AdminRoleRoute pageKey="product">
                <ProductForm />
              </AdminRoleRoute>
            </LayoutAdmin>
          </ProtectedRouteAdmin>
        }
      />
      <Route
        path="/admin/user"
        element={
          <ProtectedRouteAdmin>
            <LayoutAdmin>
              <AdminRoleRoute pageKey="user">
                <User />
              </AdminRoleRoute>
            </LayoutAdmin>
          </ProtectedRouteAdmin>
        }
      />
      <Route
        path="/admin/order"
        element={
          <ProtectedRouteAdmin>
            <LayoutAdmin>
              <AdminRoleRoute pageKey="order">
                <Order />
              </AdminRoleRoute>
            </LayoutAdmin>
          </ProtectedRouteAdmin>
        }
      />
      <Route
        path="/admin/order/:id"
        element={
          <ProtectedRouteAdmin>
            <LayoutAdmin>
              <AdminRoleRoute pageKey="order">
                <OrderDetail />
              </AdminRoleRoute>
            </LayoutAdmin>
          </ProtectedRouteAdmin>
        }
      />
      <Route
        path="/admin/staff"
        element={
          <ProtectedRouteAdmin>
            <LayoutAdmin>
              <AdminRoleRoute pageKey="staff">
                <Staff />
              </AdminRoleRoute>
            </LayoutAdmin>
          </ProtectedRouteAdmin>
        }
      />
      <Route
        path="/admin/discount"
        element={
          <ProtectedRouteAdmin>
            <LayoutAdmin>
              <AdminRoleRoute pageKey="discount">
                <Discount />
              </AdminRoleRoute>
            </LayoutAdmin>
          </ProtectedRouteAdmin>
        }
      />
      <Route
        path="/admin/category"
        element={
          <ProtectedRouteAdmin>
            <LayoutAdmin>
              <AdminRoleRoute pageKey="category">
                <Category />
              </AdminRoleRoute>
            </LayoutAdmin>
          </ProtectedRouteAdmin>
        }
      />
      <Route
        path="/admin/reviews"
        element={
          <ProtectedRouteAdmin>
            <LayoutAdmin>
              <AdminRoleRoute pageKey="reviews">
                <Review />
              </AdminRoleRoute>
            </LayoutAdmin>
          </ProtectedRouteAdmin>
        }
      />
      <Route path="*" element={<NotExistedPage />} />
    </Routes>
  );
};

export default Routers;
