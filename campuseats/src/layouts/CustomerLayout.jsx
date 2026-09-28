import { Outlet } from "react-router-dom";
import CustomerHeader from "../components/navigation/CustomerHeader";
import Footer from "../components/navigation/Footer";

export default function CustomerLayout() {
  return (
    <>
      <a href="#main-content" className="skip-link">Skip to content</a>
      <CustomerHeader />
      <main id="main-content" className="container" style={{ paddingBlock: "var(--space-8)" }}>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
