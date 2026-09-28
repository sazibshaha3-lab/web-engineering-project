import { BrowserRouter, Routes, Route } from "react-router-dom";
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

import RequireCustomerAuth from "./components/auth/RequireCustomerAuth";
import RequireRestaurantRole from "./components/auth/RequireRestaurantRole";
import RequireRiderRole from "./components/auth/RequireRiderRole";
import RequireAdminRole from "./components/auth/RequireAdminRole";

import PublicLayout from "./layouts/PublicLayout";
import CustomerLayout from "./layouts/CustomerLayout";
import RestaurantLayout from "./layouts/RestaurantLayout";
import RiderLayout from "./layouts/RiderLayout";
import AdminLayout from "./layouts/AdminLayout";

import Home from "./pages/public/Home";
import Login from "./pages/public/Login";
import Register from "./pages/public/Register";
import VerifyOtp from "./pages/public/VerifyOtp";
import NotFound from "./pages/public/NotFound";

import CustomerHome from "./pages/customer/CustomerHome";
import Restaurants from "./pages/customer/Restaurants";
import RestaurantDetail from "./pages/customer/RestaurantDetail";
import Cart from "./pages/customer/Cart";
import Checkout from "./pages/customer/Checkout";
import Orders from "./pages/customer/Orders";
import OrderDetails from "./pages/customer/OrderDetails";
import OrderTracking from "./pages/customer/OrderTracking";
import Profile from "./pages/customer/Profile";
import Locations from "./pages/customer/Locations";
import OrderSuccess from "./pages/customer/OrderSuccess";

import RestaurantDashboard from "./pages/restaurant/RestaurantDashboard";
import RestaurantMenu from "./pages/restaurant/RestaurantMenu";
import RestaurantOrders from "./pages/restaurant/RestaurantOrders";
import RestaurantOrderDetails from "./pages/restaurant/RestaurantOrderDetails";
import RestaurantProfile from "./pages/restaurant/RestaurantProfile";

import RiderDashboard from "./pages/rider/RiderDashboard";
import RiderDeliveries from "./pages/rider/RiderDeliveries";
import RiderDeliveryDetails from "./pages/rider/RiderDeliveryDetails";
import RiderHistory from "./pages/rider/RiderHistory";
import RiderProfile from "./pages/rider/RiderProfile";

import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminOrderDetails from "./pages/admin/AdminOrderDetails";
import AdminCustomers from "./pages/admin/AdminCustomers";
import AdminCustomerDetails from "./pages/admin/AdminCustomerDetails";
import AdminRestaurants from "./pages/admin/AdminRestaurants";
import AdminRestaurantDetails from "./pages/admin/AdminRestaurantDetails";
import AdminRiders from "./pages/admin/AdminRiders";
import AdminRiderDetails from "./pages/admin/AdminRiderDetails";
import AdminProfile from "./pages/admin/AdminProfile";

export default function App() {
  return (
    <AuthProvider>
      <LocationProvider>
        <AddressProvider>
          <RestaurantDataProvider>
            <ToastProvider>
              <CartProvider>
                <OrderProvider>
                  <RiderProvider>
                    <AdminProvider>
                      <CartConflictDialog />
                      <BrowserRouter>
                        <Routes>
                          <Route element={<PublicLayout />}>
                            <Route path="/" element={<Home />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/register" element={<Register />} />
                            <Route path="/verify-otp" element={<VerifyOtp />} />
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
                              <Route path="locations" element={<Locations />} />
                            </Route>
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

                          <Route element={<RequireRiderRole />}>
                            <Route path="/rider" element={<RiderLayout />}>
                              <Route index element={<RiderDashboard />} />
                              <Route path="profile" element={<RiderProfile />} />
                              <Route path="deliveries" element={<RiderDeliveries />} />
                              <Route path="deliveries/:orderId" element={<RiderDeliveryDetails />} />
                              <Route path="history" element={<RiderHistory />} />
                            </Route>
                          </Route>

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
                      </BrowserRouter>
                    </AdminProvider>
                  </RiderProvider>
                </OrderProvider>
              </CartProvider>
            </ToastProvider>
          </RestaurantDataProvider>
        </AddressProvider>
      </LocationProvider>
    </AuthProvider>
  );
}
