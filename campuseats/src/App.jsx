import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import { ToastProvider } from "./components/feedback/ToastContext";
import CartConflictDialog from "./components/cart/CartConflictDialog";
import { AuthProvider } from "./context/AuthContext";
import { LocationProvider } from "./context/LocationContext";
import { CartProvider } from "./context/CartContext";
import { AddressProvider } from "./context/AddressContext";
import { OrderProvider } from "./context/OrderContext";
import { RestaurantDataProvider } from "./context/RestaurantContext";
import { RiderProvider } from "./context/RiderContext";
import { AdminProvider } from "./context/AdminContext";
import { ThemeProvider } from "./context/ThemeContext";

import RequireCustomerAuth from "./components/auth/RequireCustomerAuth";
import RequireRestaurantRole from "./components/auth/RequireRestaurantRole";
import RequireRiderRole from "./components/auth/RequireRiderRole";
import RequireAdminRole from "./components/auth/RequireAdminRole";

import PublicLayout from "./layouts/PublicLayout";
import CustomerLayout from "./layouts/CustomerLayout";
import RestaurantLayout from "./layouts/RestaurantLayout";
import RiderLayout from "./layouts/RiderLayout";
import AdminLayout from "./layouts/AdminLayout";

const Home = lazy(() => import("./pages/public/Home"));
const Login = lazy(() => import("./pages/public/Login"));
const Register = lazy(() => import("./pages/public/Register"));
const VerifyOtp = lazy(() => import("./pages/public/VerifyOtp"));
const NotFound = lazy(() => import("./pages/public/NotFound"));
const CompanyPage = lazy(() => import("./pages/public/CompanyPage"));

const CustomerHome = lazy(() => import("./pages/customer/CustomerHome"));
const Restaurants = lazy(() => import("./pages/customer/Restaurants"));
const RestaurantDetail = lazy(() => import("./pages/customer/RestaurantDetail"));
const Cart = lazy(() => import("./pages/customer/Cart"));
const Checkout = lazy(() => import("./pages/customer/Checkout"));
const Orders = lazy(() => import("./pages/customer/Orders"));
const OrderDetails = lazy(() => import("./pages/customer/OrderDetails"));
const OrderTracking = lazy(() => import("./pages/customer/OrderTracking"));
const Profile = lazy(() => import("./pages/customer/Profile"));
const Locations = lazy(() => import("./pages/customer/Locations"));
const OrderSuccess = lazy(() => import("./pages/customer/OrderSuccess"));

const RestaurantDashboard = lazy(() => import("./pages/restaurant/RestaurantDashboard"));
const RestaurantMenu = lazy(() => import("./pages/restaurant/RestaurantMenu"));
const RestaurantOrders = lazy(() => import("./pages/restaurant/RestaurantOrders"));
const RestaurantOrderDetails = lazy(() => import("./pages/restaurant/RestaurantOrderDetails"));
const RestaurantProfile = lazy(() => import("./pages/restaurant/RestaurantProfile"));
const RestaurantApprovalPending = lazy(() => import("./pages/restaurant/RestaurantApprovalPending"));

const RiderDashboard = lazy(() => import("./pages/rider/RiderDashboard"));
const RiderDeliveries = lazy(() => import("./pages/rider/RiderDeliveries"));
const RiderDeliveryDetails = lazy(() => import("./pages/rider/RiderDeliveryDetails"));
const RiderHistory = lazy(() => import("./pages/rider/RiderHistory"));
const RiderProfile = lazy(() => import("./pages/rider/RiderProfile"));
const RiderApprovalPending = lazy(() => import("./pages/rider/RiderApprovalPending"));

const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminOrders = lazy(() => import("./pages/admin/AdminOrders"));
const AdminOrderDetails = lazy(() => import("./pages/admin/AdminOrderDetails"));
const AdminCustomers = lazy(() => import("./pages/admin/AdminCustomers"));
const AdminCustomerDetails = lazy(() => import("./pages/admin/AdminCustomerDetails"));
const AdminRestaurants = lazy(() => import("./pages/admin/AdminRestaurants"));
const AdminRestaurantDetails = lazy(() => import("./pages/admin/AdminRestaurantDetails"));
const AdminRiders = lazy(() => import("./pages/admin/AdminRiders"));
const AdminRiderDetails = lazy(() => import("./pages/admin/AdminRiderDetails"));
const AdminProfile = lazy(() => import("./pages/admin/AdminProfile"));

export default function App() {
  return (
    <ThemeProvider>
    <AuthProvider>
      <AddressProvider>
        <LocationProvider>
          <ToastProvider>
            <RestaurantDataProvider>
              <CartProvider>
                <OrderProvider>
                  <RiderProvider>
                    <AdminProvider>
                      <CartConflictDialog />
                      <BrowserRouter>
                        <Suspense fallback={<div role="status" style={{ minHeight: "60vh", display: "grid", placeItems: "center" }}>Loading page…</div>}>
                        <Routes>
                          <Route element={<PublicLayout />}>
                            <Route path="/" element={<Home />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/register" element={<Register />} />
                            <Route path="/verify-otp" element={<VerifyOtp />} />
                            <Route path="/about" element={<CompanyPage page="about" />} />
                            <Route path="/careers" element={<CompanyPage page="careers" />} />
                            <Route path="/help" element={<CompanyPage page="help" />} />
                            <Route path="/terms" element={<CompanyPage page="terms" />} />
                            <Route path="/privacy" element={<CompanyPage page="privacy" />} />
                          </Route>

                          <Route path="/customer" element={<CustomerLayout />}>
                            {/* Guest-accessible: browsing and cart require no account. */}
                            <Route index element={<CustomerHome />} />
                            <Route path="restaurants" element={<Restaurants />} />
                            <Route path="restaurant/:id" element={<RestaurantDetail />} />
                            <Route path="cart" element={<Cart />} />

                            {/* Account-specific pages require an explicit customer login. */}
                            <Route element={<RequireCustomerAuth />}>
                              <Route path="checkout" element={<Checkout />} />
                              <Route path="orders" element={<Orders />} />
                              <Route path="orders/:orderId" element={<OrderDetails />} />
                              <Route path="orders/:orderId/track" element={<OrderTracking />} />
                              <Route path="order-success" element={<OrderSuccess />} />
                              <Route path="profile" element={<Profile />} />
                            </Route>
                            <Route path="locations" element={<Locations />} />
                          </Route>

                          <Route element={<RequireRestaurantRole />}>
                            <Route path="/restaurant" element={<RestaurantLayout />}>
                              <Route index element={<RestaurantDashboard />} />
                              <Route path="profile" element={<RestaurantProfile />} />
                              <Route path="menu" element={<RestaurantMenu />} />
                              <Route path="orders" element={<RestaurantOrders />} />
                              <Route path="orders/:orderId" element={<RestaurantOrderDetails />} />
                            </Route>
                          </Route>
                          <Route path="/restaurant/pending" element={<RestaurantApprovalPending />} />

                          <Route element={<RequireRiderRole />}>
                            <Route path="/rider" element={<RiderLayout />}>
                              <Route index element={<RiderDashboard />} />
                              <Route path="profile" element={<RiderProfile />} />
                              <Route path="deliveries" element={<RiderDeliveries />} />
                              <Route path="deliveries/:orderId" element={<RiderDeliveryDetails />} />
                              <Route path="history" element={<RiderHistory />} />
                            </Route>
                          </Route>
                          <Route path="/rider/pending" element={<RiderApprovalPending />} />

                          <Route element={<RequireAdminRole />}>
                            <Route path="/admin" element={<AdminLayout />}>
                              <Route index element={<AdminDashboard />} />
                              <Route path="orders" element={<AdminOrders />} />
                              <Route path="orders/:orderId" element={<AdminOrderDetails />} />
                              <Route path="customers" element={<AdminCustomers />} />
                              <Route path="customers/:customerId" element={<AdminCustomerDetails />} />
                              <Route path="restaurants" element={<AdminRestaurants />} />
                              <Route path="restaurants/:restaurantId" element={<AdminRestaurantDetails />} />
                              <Route path="riders" element={<AdminRiders />} />
                              <Route path="riders/:riderId" element={<AdminRiderDetails />} />
                              <Route path="profile" element={<AdminProfile />} />
                            </Route>
                          </Route>

                          <Route path="*" element={<NotFound />} />
                        </Routes>
                        </Suspense>
                      </BrowserRouter>
                    </AdminProvider>
                  </RiderProvider>
                </OrderProvider>
              </CartProvider>
            </RestaurantDataProvider>
          </ToastProvider>
        </LocationProvider>
      </AddressProvider>
    </AuthProvider>
    </ThemeProvider>
  );
}
