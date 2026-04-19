import { Outlet } from "react-router-dom";
import Footer from "./Footer";
import Navbar from "./Navbar";
import PageTransition from "./PageTransition";

export default function Layout() {
  return (
    <>
      <PageTransition />
      <Navbar />
      <Outlet />
      <Footer />
    </>
  );
}
