import { Outlet } from "react-router-dom";
import CustomerHeader from "../components/navigation/CustomerHeader";
import Footer from "../components/navigation/Footer";
import FloatingActions from "../components/navigation/FloatingActions";
import MobileCartBar from "../components/cart/MobileCartBar";
import "./CustomerLayout.css";

export default function CustomerLayout() {
  return (
    <>
      <a href="#main-content" className="skip-link">Skip to content</a>
      <CustomerHeader />
      <main id="main-content" className="container customer-main-content">
        <Outlet />
      </main>
      <MobileCartBar />
      <FloatingActions />
      <Footer />
    </>
  );
}
