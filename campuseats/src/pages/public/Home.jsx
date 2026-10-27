import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  Bike,
  ShieldCheck,
  Wallet,
  Timer,
  Store,
  ArrowRight,
  MapPin,
  ShoppingBag,
  Check,
  Star,
  Clock3,
  MapPinned,
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
    icon: Store,
    title: "Choose a restaurant",
    desc: "Explore nearby restaurants and mess kitchens, then pick a place that fits your craving.",
  },
  {
    icon: ShoppingBag,
    title: "Choose your food",
    desc: "Pick your dishes, customize them, and add everything you want to your cart.",
  },
  {
    icon: Bike,
    title: "Track your delivery",
    desc: "Place your order and follow it from the kitchen to your door.",
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
  const howItWorksRef = useRef(null);
  const [howItWorksVisible, setHowItWorksVisible] = useState(false);
  const [activeHeroSlide, setActiveHeroSlide] = useState(0);
  const [heroPaused, setHeroPaused] = useState(false);

  const heroSlides = useMemo(() => {
    const availableFoods = foods.filter((food) => food.isAvailable && food.image);
    const slides = [];
    const usedImages = new Set();

    // Show a mix of dishes when possible, then fill any remaining spots with popular items.
    for (const food of [...availableFoods].sort((a, b) => Number(b.isPopular) - Number(a.isPopular))) {
      if (slides.length >= 6) break;
      if (usedImages.has(food.image)) continue;
      if (food.category && slides.some((slide) => slide.category === food.category)) continue;
      slides.push(food);
      usedImages.add(food.image);
    }
    for (const food of [...availableFoods].sort((a, b) => Number(b.isPopular) - Number(a.isPopular))) {
      if (slides.length >= 6) break;
      if (usedImages.has(food.image)) continue;
      slides.push(food);
      usedImages.add(food.image);
    }

    return slides.length ? slides : [{ id: "hero-fallback", name: "Campus favourite pizza", image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=900&q=75&auto=format&fit=crop" }];
  }, [foods]);

  useEffect(() => {
    setActiveHeroSlide((current) => current % heroSlides.length);
  }, [heroSlides.length]);

  useEffect(() => {
    if (heroPaused || heroSlides.length < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;
    const timer = window.setInterval(() => {
      setActiveHeroSlide((current) => (current + 1) % heroSlides.length);
    }, 4800);
    return () => window.clearInterval(timer);
  }, [heroPaused, heroSlides.length]);

  useEffect(() => {
    const section = howItWorksRef.current;
    if (!section || howItWorksVisible) return undefined;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setHowItWorksVisible(true);
        observer.disconnect();
      }
    }, { threshold: 0.18 });
    observer.observe(section);
    return () => observer.disconnect();
  }, [howItWorksVisible]);
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

          <div
            className="hero__visual"
            role="group"
            aria-label="Popular dishes"
            aria-roledescription="carousel"
            onMouseEnter={() => setHeroPaused(true)}
            onMouseLeave={() => setHeroPaused(false)}
            onFocus={() => setHeroPaused(true)}
            onBlur={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget)) setHeroPaused(false);
            }}
          >
            <div className="hero__blob" />
            <div className="hero__image-frame">
              {heroSlides.map((slide, index) => (
                <img
                  key={slide.id ?? slide.image}
                  className={`hero__image ${index === activeHeroSlide ? "is-active" : ""}`}
                  src={slide.image}
                  alt={slide.name}
                  loading={index === 0 ? "eager" : "lazy"}
                  fetchPriority={index === 0 ? "high" : "auto"}
                  aria-hidden={index !== activeHeroSlide}
                />
              ))}
              {heroSlides.length > 1 && (
                <div className="hero__slide-dots" role="group" aria-label="Choose a featured dish">
                  {heroSlides.map((slide, index) => (
                    <button
                      key={slide.id ?? slide.image}
                      type="button"
                      className={`hero__slide-dot ${index === activeHeroSlide ? "is-active" : ""}`}
                      aria-label={`Show ${slide.name}`}
                      aria-pressed={index === activeHeroSlide}
                      onClick={() => setActiveHeroSlide(index)}
                    />
                  ))}
                </div>
              )}
              {heroSlides[activeHeroSlide]?.name && (
                <span className="hero__slide-caption">{heroSlides[activeHeroSlide].name}</span>
              )}
            </div>
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

      <section className="section section--steps" ref={howItWorksRef}>
        <div className="container">
          <div className="steps-heading">
            <span className="steps-heading__eyebrow">Simple from start to finish</span>
            <h2>How CampusEats works</h2>
            <p>From your first browse to a meal at your door, ordering takes just a few steps.</p>
          </div>
          <ol className={`steps ${howItWorksVisible ? "is-visible" : ""}`}>
            {steps.map((step, i) => (
              <li key={step.title} className="steps__item">
                <div className={`steps__art steps__art--${i + 1}`} aria-hidden="true">
                  {i === 0 && (
                    <>
                      <span className="steps__art-orbit" />
                      <span className="steps__restaurant-card steps__restaurant-card--back"><Store size={22} /></span>
                      <span className="steps__restaurant-card steps__restaurant-card--front"><Store size={25} /><span className="steps__stars"><Star size={12} fill="currentColor" /> 4.8 · Open</span></span>
                      <span className="steps__pin"><MapPin size={25} fill="currentColor" /></span>
                    </>
                  )}
                  {i === 1 && (
                    <>
                      <span className="steps__phone">
                        <span className="steps__phone-notch" />
                        <span className="steps__food-row"><i /><b /><em>৳180</em></span>
                        <span className="steps__food-row"><i /><b /><em>৳240</em></span>
                        <span className="steps__food-row"><i /><b /><em>৳120</em></span>
                      </span>
                      <span className="steps__cart-bubble"><ShoppingBag size={21} /><Check size={13} /></span>
                      <span className="steps__price-bubble">Your picks</span>
                    </>
                  )}
                  {i === 2 && (
                    <>
                      <span className="steps__route"><i /><i /><i /></span>
                      <span className="steps__delivery-pin steps__delivery-pin--start"><Store size={19} /></span>
                      <span className="steps__rider"><Bike size={54} strokeWidth={1.6} /></span>
                      <span className="steps__delivery-pin steps__delivery-pin--end"><MapPin size={21} fill="currentColor" /></span>
                      <span className="steps__eta"><Clock3 size={14} /> On the way</span>
                    </>
                  )}
                </div>
                <div className="steps__copy">
                  <span className="steps__number">{String(i + 1).padStart(2, "0")}</span>
                  <span className="steps__icon"><step.icon size={19} strokeWidth={1.9} /></span>
                  <h3>{step.title}</h3>
                  <p>{step.desc}</p>
                </div>
              </li>
            ))}
          </ol>
          <Link to="/customer/restaurants" className="steps__cta">Explore restaurants <ArrowRight size={17} /></Link>
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

      <section className="partnership-section" id="partnerships">
        <div className="container">
          <div className="partnership-section__heading">
            <span>Grow with CampusEats</span>
            <h2>Want to join our community?</h2>
            <p>Deliver with us or bring your restaurant to hungry students nearby.</p>
          </div>
          <div className="partnership-grid">
            <article className="partnership-card">
              <img
                src="https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=1100&q=80&auto=format&fit=crop"
                alt="Motorcycle ready for a delivery ride"
                loading="lazy"
              />
              <div className="partnership-card__scrim" />
              <div className="partnership-card__content">
                <span>Delivery partners</span>
                <h3>Join as Rider</h3>
                <p>Choose your hours and deliver around campus.</p>
                <Link to="/register" state={{ role: "rider" }} className="partnership-card__button">
                  Join Now <ArrowRight size={19} />
                </Link>
              </div>
            </article>
            <article className="partnership-card">
              <img
                src="https://images.unsplash.com/photo-1556761175-b413da4baf72?w=1100&q=80&auto=format&fit=crop"
                alt="Restaurant partners discussing their business"
                loading="lazy"
              />
              <div className="partnership-card__scrim" />
              <div className="partnership-card__content">
                <span>Restaurant partners</span>
                <h3>Join as Restaurant</h3>
                <p>Reach more students and manage orders in one place.</p>
                <Link to="/register" state={{ role: "restaurant_owner" }} className="partnership-card__button">
                  Join Now <ArrowRight size={19} />
                </Link>
              </div>
            </article>
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
