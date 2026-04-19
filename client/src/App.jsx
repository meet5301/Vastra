import { BrowserRouter, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import ScrollToTop from "./components/ScrollToTop";
import About from "./pages/About";
import Accessories from "./pages/Accessories";
import Categories from "./pages/Categories";
import Checkout from "./pages/Checkout";
import Contact from "./pages/Contact";
import Detail from "./pages/Detail";
import Home from "./pages/Home";
import Journal from "./pages/Journal";
import Kids from "./pages/Kids";
import Login from "./pages/Login";
import Men from "./pages/Men";
import NotFound from "./pages/NotFound";
import Profile from "./pages/Profile";
import Review from "./pages/Review";
import Search from "./pages/Search";
import Shop from "./pages/Shop";
import ShoppingBag from "./pages/ShoppingBag";
import Signup from "./pages/Signup";
import Story from "./pages/Story";
import Wishlist from "./pages/Wishlist";
import Women from "./pages/Women";

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/index" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/detail" element={<Detail />} />
          <Route path="/shopingbag" element={<ShoppingBag />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/men" element={<Men />} />
          <Route path="/women" element={<Women />} />
          <Route path="/kids" element={<Kids />} />
          <Route path="/accessories" element={<Accessories />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/journal" element={<Journal />} />
          <Route path="/story" element={<Story />} />
          <Route path="/review" element={<Review />} />
          <Route path="/search" element={<Search />} />
          <Route path="*" element={<NotFound />} />
        </Route>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App
