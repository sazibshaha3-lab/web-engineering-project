import { Link } from "react-router-dom";
import {
  MapPinned,
  Compass,
  ShoppingBag,
  Bike,
  ShieldCheck,
  Wallet,
  Timer,
  Store,
  ArrowRight,
} from "lucide-react";
import SearchBar from "../../components/forms/SearchBar";
import SectionHeader from "../../components/common/SectionHeader";
import CategoryCard from "../../components/cards/CategoryCard";
import RestaurantCard from "../../components/cards/RestaurantCard";
import FoodCard from "../../components/cards/FoodCard";
import Button from "../../components/common/Button";
import { categories } from "../../data/categories";
import { useRestaurantData } from "../../context/RestaurantContext";
import "./Home.css";

const steps = [
  {
    icon: MapPinned,
    title: "Choose your location",
    desc: "Drop a pin on your hostel block, hall or apartment so we know where to send your order.",
  },
  {
    icon: Compass,
    title: "Discover food",
    desc: "Browse campus restaurants and mess kitchens by cuisine, rating or how fast they deliver.",
  },
  {
    icon: ShoppingBag,
    title: "Place your order",
    desc: "Build your cart, pick a delivery time, and confirm — no back-and-forth phone calls.",
  },
  {
    icon: Bike,
    title: "Get it delivered",
    desc: "A nearby rider picks it up and brings it straight to your door, tracked the whole way.",
  },
];

const values = [
  { icon: Timer, title: "Fast delivery", desc: "Most orders reach you in under 30 minutes from kitchens near campus." },
  { icon: Store, title: "Nearby restaurants", desc: "From hostel messes to favourite local spots, all within a short ride." },
  { icon: ShoppingBag, title: "Easy ordering", desc: "A few taps from craving to checkout, with your addresses saved for next time." },
  { icon: MapPinned, title: "Multiple locations", desc: "Order for your room, your lab, or a friend's hall without re-entering details." },
  { icon: ShieldCheck, title: "Secure payments", desc: "Pay on delivery or online with checkout built to keep your details safe." },
  { icon: Wallet, title: "Reliable tracking", desc: "Know exactly where your order is, from the kitchen to your doorstep." },
];

export default function Home() {
  const { restaurants, foods } = useRestaurantData();
  return (
    <>
      <section className="hero">
        <div className="container hero__inner">
          <div className="hero__content rise-in">
            <p className="hero__eyebrow">Campus food, sorted</p>
            <h1 className="hero__title">
              Everything on campus worth eating, brought to your door.
            </h1>
            <p className="hero__desc">
              From hostel mess favourites to the biryani place three streets over —
              order from restaurants near your campus and get it delivered by
              riders who know every shortcut.
            </p>
            <div className="hero__search">
              <SearchBar />
            </div>
            <div className="hero__tags">
              <span>Trending near you:</span>
              <Link to="/customer/restaurants?category=biryani">Biryani</Link>
              <Link to="/customer/restaurants?category=burger">Burgers</Link>
              <Link to="/customer/restaurants?category=fastfood">Fast food</Link>
              <Link to="/customer/restaurants?category=desserts">Desserts</Link>
            </div>
          </div>

          <div className="hero__visual" aria-hidden="true">
            <div className="hero__blob" />
            <img
              className="hero__image"
              src="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=900&q=75&auto=format&fit=crop"
              alt=""
              loading="eager"
            />
            <div className="hero__floating-card hero__floating-card--top">
              <Bike size={18} strokeWidth={2} />
              <div>
                <strong>Out for delivery</strong>
                <span>Arriving in 12 min</span>
              </div>
            </div>
            <div className="hero__floating-card hero__floating-card--bottom">
              <ShieldCheck size={18} strokeWidth={2} />
              <div>
                <strong>4.8 average rating</strong>
                <span>From 2,300+ campus orders</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHeader title="What are you craving?" description="Jump straight to a category." />
          <div className="scroll-rail category-rail">
            {categories.map((cat) => (
              <CategoryCard key={cat.id} category={cat} />
            ))}
          </div>
        </div>
      </section>

      <section className="section section--alt">
        <div className="container">
          <SectionHeader
            title="Popular restaurants near you"
            description="Highly rated kitchens delivering to campus right now."
            linkTo="/customer/restaurants"
          />
          <div className="grid grid--restaurants">
            {restaurants.slice(0, 6).map((r) => (
              <RestaurantCard key={r.id} restaurant={r} />
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHeader
            title="Popular right now"
            description="The dishes campus keeps ordering this week."
            linkTo="/customer/restaurants"
            linkLabel="Browse all food"
          />
          <div className="grid grid--foods">
            {foods.slice(0, 8).map((f) => (
              <FoodCard key={f.id} food={f} />
            ))}
          </div>
        </div>
      </section>

      <section className="section section--steps">
        <div className="container">
          <SectionHeader title="How CampusEats works" description="From craving to doorstep in four simple steps." />
          <ol className="steps">
            {steps.map((step, i) => (
              <li key={step.title} className="steps__item">
                <span className="steps__number">{String(i + 1).padStart(2, "0")}</span>
                <span className="steps__icon">
                  <step.icon size={22} strokeWidth={1.8} />
                </span>
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section section--alt">
        <div className="container">
          <SectionHeader title="Built for campus life" description="The details that make ordering feel effortless." />
          <div className="grid grid--values">
            {values.map((v) => (
              <div key={v.title} className="value-card">
                <span className="value-card__icon">
                  <v.icon size={20} strokeWidth={1.8} />
                </span>
                <h4>{v.title}</h4>
                <p>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="cta">
            <div>
              <h2>Hungry? Your next order is a few taps away.</h2>
              <p>Join thousands of students already ordering through CampusEats.</p>
            </div>
            <div className="cta__actions">
              <Button as={Link} to="/register" variant="dark" size="lg" icon={ArrowRight} iconPosition="right">
                Get started
              </Button>
              <Button as={Link} to="/customer/restaurants" variant="secondary" size="lg">
                Browse restaurants
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
