import { BrowserRouter, Route, Routes } from "react-router-dom";
import AdminLogin from "./pages/AdminLogin";
import Analytics from "./pages/Analytics";
import Brands from "./pages/Brands";
import Dashboard from "./pages/Dashboard";
import Discounts from "./pages/Discounts";
import Orders from "./pages/Orders";
import Placements from "./pages/Placements";
import Products from "./pages/Products";
import Users from "./pages/Users";

function App() {
  return (
    <BrowserRouter basename="/admin">
      <Routes>
        <Route path="/" element={<AdminLogin />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/products" element={<Products />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/users" element={<Users />} />
        <Route path="/brands" element={<Brands />} />
        <Route path="/discounts" element={<Discounts />} />
        <Route path="/placements" element={<Placements />} />
        <Route path="/analytics" element={<Analytics />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App
