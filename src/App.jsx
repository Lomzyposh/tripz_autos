import { useEffect, useState, useRef, createContext, useContext } from "react";
import {
  Routes,
  Route,
  Link,
  NavLink,
  useNavigate,
  useSearchParams,
  useParams,
  useLocation,
} from "react-router-dom";
import {
  Phone,
  MapPin,
  Menu,
  X,
  Search,
  MessageCircle,
  Check,
  Plus,
  Minus,
  ChevronLeft,
  ChevronRight,
  Upload,
  ShieldCheck,
  CalendarDays,
} from "lucide-react";
import config from "./config/siteConfig";
import { inventoryService } from "./services/inventoryService";
import {
  whatsappUrl,
  carEnquiry,
  enquiryService,
} from "./services/enquiryService";
import { currencyService } from "./services/currencyService";
const Data = createContext();
const nav = [
  ["/", "Home"],
  ["/inventory", "Inventory"],
  ["/about", "About Us"],
  ["/services", "Services"],
  ["/contact", "Contact"],
];
function WhatsApp({
  message,
  children = "Chat on WhatsApp",
  className = "button",
}) {
  return (
    <a
      className={className}
      href={whatsappUrl(message)}
      target="_blank"
      rel="noreferrer"
    >
      <MessageCircle size={18} />
      {children}
    </a>
  );
}
function Brand() {
  return (
    <Link to="/" className="brand">
      {config.logo ? (
        <img src={config.logo} alt={config.name} />
      ) : (
        <>
          <span>
            {config.shortName}
            <span className="brand-mark">/</span>
          </span>
          <small>A U T O S</small>
        </>
      )}
    </Link>
  );
}
function Header() {
  const [open, setOpen] = useState(false);
  const { currency, setCurrency } = useContext(Data);
  const location = useLocation();
  useEffect(() => setOpen(false), [location]);
  return (
    <header>
      <div className="topbar shell">
        <a href={`tel:${config.phone}`}>
          <Phone size={14} /> {config.phone}
        </a>
        <span>
          <MapPin size={14} />
          {config.address}
        </span>
        <label className="currency">
          <span>Currency</span>
          <select
            aria-label="Display currency"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
          >
            {config.supportedCurrencies.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
      </div>
      <div className="navwrap">
        <div className="navbar shell">
          <Brand />
          <nav className={open ? "open" : ""} aria-label="Main navigation">
            {nav.map(([path, label]) => (
              <NavLink key={path} to={path} end={path === "/"}>
                {label}
              </NavLink>
            ))}
          </nav>
          <Link to="/sell-your-car" className="button nav-cta">
            Sell your car
          </Link>
          <button
            className="menu-button"
            aria-label={open ? "Close navigation" : "Open navigation"}
            aria-expanded={open}
            onClick={() => setOpen(!open)}
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>
    </header>
  );
}
function Footer() {
  return (
    <footer>
      <div className="shell footer-main">
        <div>
          <Brand />
          <p>{config.description}</p>
          <div className="socials">
            {Object.entries(config.socialLinks)
              .filter(([, v]) => v)
              .map(([k, v]) => (
                <a href={v} target="_blank" rel="noreferrer" key={k}>
                  {k}
                </a>
              ))}
          </div>
        </div>
        <div>
          <small>EXPLORE</small>
          {nav.slice(1).map(([p, l]) => (
            <Link key={p} to={p}>
              {l}
            </Link>
          ))}
        </div>
        <div>
          <small>LET’S TALK</small>
          <a href={`tel:${config.phone}`}>{config.phone}</a>
          <a href={`mailto:${config.email}`}>{config.email}</a>
          <span>{config.address}</span>
          <span>{config.hours}</span>
        </div>
        <div>
          <small>YOUR NEXT MOVE</small>
          <Link to="/inventory">Find your car</Link>
          <Link to="/sell-your-car">Sell your car</Link>
          <WhatsApp
            className="text-link"
            message={`Hello ${config.name}, I'd like help finding a car.`}
          />
        </div>
      </div>
      <div className="shell footer-bottom">
        <span>
          © {new Date().getFullYear()} {config.name}
        </span>
        <span>
          {config.demo
            ? "Demo inventory · Sample prices & contact details"
            : "Find your next chapter."}
        </span>
        <span>Website by Tripz Autos</span>
      </div>
    </footer>
  );
}
function Card({ car }) {
  const { currency, rates } = useContext(Data);
  return (
    <article className="car-card">
      <Link className="car-image" to={`/inventory/${car.id}`}>
        <img
          src={car.images[0]}
          alt={`${car.make} ${car.model}`}
          loading="lazy"
        />
        <span className="car-label">{car.condition}</span>
        <span className="image-view">View vehicle</span>
      </Link>
      <div className="car-info">
        <span className="eyebrow">
          {car.year} · {car.bodyStyle}
        </span>
        <Link to={`/inventory/${car.id}`}>
          <h3>
            {car.make} {car.model}
          </h3>
        </Link>
        <div className="car-price">
          <strong>{currencyService.format(car.price, currency, rates)}</strong>
          <a
            href={carEnquiry(car)}
            aria-label={`Enquire about ${car.make} ${car.model}`}
            target="_blank"
            rel="noreferrer"
          >
            <MessageCircle size={20} />
          </a>
        </div>
      </div>
    </article>
  );
}
function SearchBar({ compact = false }) {
  const { cars } = useContext(Data);
  const navigate = useNavigate();
  const [make, setMake] = useState(""),
    [model, setModel] = useState(""),
    [budget, setBudget] = useState("");
  const makes = [...new Set(cars.map((c) => c.make))];
  return (
    <form
      className={`search-bar ${compact ? "compact" : ""}`}
      onSubmit={(e) => {
        e.preventDefault();
        navigate(
          `/inventory?${new URLSearchParams({ make, q: model, max: budget })}`,
        );
      }}
    >
      <label>
        <span>MAKE</span>
        <select
          value={make}
          onChange={(e) => {
            setMake(e.target.value);
            setModel("");
          }}
        >
          <option value="">All makes</option>
          {makes.map((m) => (
            <option key={m}>{m}</option>
          ))}
        </select>
      </label>
      <label>
        <span>MODEL</span>
        <input
          value={model}
          onChange={(e) => setModel(e.target.value)}
          placeholder="Any model"
        />
      </label>
      <label>
        <span>YOUR BUDGET</span>
        <select value={budget} onChange={(e) => setBudget(e.target.value)}>
          <option value="">Any price</option>
          <option value="50000000">Under ₦50 million</option>
          <option value="75000000">Under ₦75 million</option>
          <option value="150000000">Under ₦150 million</option>
        </select>
      </label>
      <button className="button" type="submit">
        <Search size={18} />
        Find a car
      </button>
    </form>
  );
}
function Sourcing({ query = "" }) {
  return (
    <section className="sourcing">
      <div>
        <span className="eyebrow">LET US FIND IT FOR YOU</span>
        <h3>Don’t see what you’re looking for?</h3>
        <p>
          Tell us the car you have in mind and your budget. We’ll talk through
          the possibilities.
        </p>
      </div>
      <WhatsApp
        message={`Hello ${config.name}, I'm looking for a car${query ? `: ${query}` : ""}. My preferred year is __ and my budget is ₦__. Can you help me source it?`}
      >
        Request a car
      </WhatsApp>
    </section>
  );
}
function Home() {
  const { cars } = useContext(Data);
  const [category, setCategory] = useState("All vehicles");
  const featured = cars.filter(
    (c) =>
      c.featured && (category === "All vehicles" || c.bodyStyle === category),
  );
  return (
    <>
      <section className="hero">
        <img
          className="hero-photo"
          src={config.heroImage}
          alt="Black Mercedes-Benz coupé beside an open countryside road"
        />
        <div className="hero-shade" />
        <div className="shell hero-content">
          <span className="eyebrow light">A BETTER WAY TO BUY & SELL CARS</span>
          <h1>
            Find your
            <br />
            next <em>chapter.</em>
          </h1>
          <p>
            From your first car to the one you’ve always wanted.
            <br className="desktop" /> Let’s find the right drive for you.
          </p>
          <div className="hero-buttons">
            <Link className="button" to="/inventory">
              Explore inventory
            </Link>
            <Link className="button ghost" to="/contact">
              Book an inspection
            </Link>
          </div>
        </div>
        <div className="hero-bottom shell">
          <span>NEW & PRE-OWNED · {config.city.toUpperCase()}</span>
          <Link to={`/inventory/${config.heroVehicleId}`}>
            Discover the featured vehicle
          </Link>
        </div>
        <div className="hero-index">
          <span>01</span>
          <div />
          <span>THE NEXT CHAPTER</span>
        </div>
      </section>
      <section className="shell search-section">
        <SearchBar />
      </section>
      <section className="brand-strip shell">
        <span>
          A GREAT DRIVE.
          <br />A NAME YOU KNOW.
        </span>
        {["TOYOTA", "Mercedes-Benz", "LEXUS", "BMW", "LAND ROVER"].map((b) => (
          <button
            key={b}
            onClick={() =>
              window.location.assign(
                "/inventory?make=" +
                  encodeURIComponent(
                    b === "TOYOTA"
                      ? "Toyota"
                      : b === "LEXUS"
                        ? "Lexus"
                        : b === "LAND ROVER"
                          ? "Land Rover"
                          : b,
                  ),
              )
            }
          >
            {b}
          </button>
        ))}
      </section>
      <section className="shell section">
        <div className="section-title">
          <div>
            <span className="eyebrow">THE SHOWROOM</span>
            <h2>
              Something for
              <br />
              your next move.
            </h2>
          </div>
          <Link to="/inventory" className="text-link">
            View all vehicles <Plus size={19} />
          </Link>
        </div>
        <div className="tabs">
          {["All vehicles", "Sedan", "SUV", "Coupé"].map((c) => (
            <button
              key={c}
              className={category === c ? "active" : ""}
              onClick={() => setCategory(c)}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="car-grid">
          {featured.map((c) => (
            <Card car={c} key={c.id} />
          ))}
        </div>
      </section>
      <section className="story-section">
        <div className="shell story-grid">
          <div className="story-image">
            <img
              src={config.aboutImage}
              alt="Mercedes-Benz in a contemporary showroom"
              loading="lazy"
            />
            <span className="image-caption">
              A CLOSER LOOK. A BETTER DECISION.
            </span>
          </div>
          <div className="story-copy">
            <span className="eyebrow">BEHIND EVERY GOOD DRIVE</span>
            <h2>
              The right car.
              <br />
              The right conversation.
            </h2>
            <p>
              A car is a big decision. Start with a team that listens to what
              you need, explains your options and gives you room to decide.
            </p>
            <div className="trust-line">
              <ShieldCheck />
              <div>
                <h4>See it before you decide</h4>
                <p>Arrange an inspection and ask the questions that matter.</p>
              </div>
            </div>
            <div className="trust-line">
              <MessageCircle />
              <div>
                <h4>A real conversation</h4>
                <p>
                  Go straight to our team for vehicle details and next steps.
                </p>
              </div>
            </div>
            <Link to="/about" className="button dark">
              Get to know us
            </Link>
          </div>
        </div>
      </section>
      <section className="shell section">
        <div className="section-title">
          <div>
            <span className="eyebrow">A CHANGE OF DIRECTION</span>
            <h2>
              Ready to pass
              <br />
              the keys on?
            </h2>
          </div>
          <p className="section-note">
            We buy cars, too. Share a few details about your vehicle and start
            the conversation.
          </p>
        </div>
        <Link to="/sell-your-car" className="sell-banner">
          <span className="sell-number">01 /</span>
          <div>
            <h3>Your car. Its next chapter.</h3>
            <p>Vehicle details, a few photos, and we’ll take it from there.</p>
          </div>
          <span className="button dark">Sell your car</span>
        </Link>
        <Sourcing />
      </section>
      <section className="visit-band">
        <div className="shell">
          <span className="eyebrow">LET’S MAKE IT REAL</span>
          <h2>
            Pictures are good.
            <br />
            In person is better.
          </h2>
          <Link to="/contact" className="button">
            Plan your visit
          </Link>
          <span className="visit-location">
            <MapPin size={17} />
            {config.address}
          </span>
        </div>
      </section>
    </>
  );
}
function Inventory() {
  const { cars, loading, error } = useContext(Data);
  const [params, setParams] = useSearchParams();
  const [sort, setSort] = useState("latest");
  const value = (k) => params.get(k) || "";
  const update = (k, v) => {
    const next = new URLSearchParams(params);
    v ? next.set(k, v) : next.delete(k);
    setParams(next, { replace: true });
  };
  const matches = cars.filter(
    (c) =>
      (!value("q") ||
        `${c.make} ${c.model}`
          .toLowerCase()
          .includes(value("q").toLowerCase())) &&
      (!value("make") || c.make === value("make")) &&
      (!value("condition") || c.condition === value("condition")) &&
      (!value("year") || c.year === Number(value("year"))) &&
      (!value("max") || c.price <= Number(value("max"))),
  );
  matches.sort((a, b) =>
    sort === "low"
      ? a.price - b.price
      : sort === "high"
        ? b.price - a.price
        : b.year - a.year,
  );
  return (
    <main className="shell section inventory">
      <div className="page-intro">
        <span className="eyebrow">FIND YOUR NEXT CHAPTER</span>
        <h1>The inventory.</h1>
        <p>New and pre-owned. Find the car that fits your world.</p>
      </div>
      <div className="inventory-layout">
        <aside className="filters">
          <h3>Narrow your search</h3>
          <label>
            Make or model
            <div className="input-icon">
              <Search size={18} />
              <input
                value={value("q")}
                onChange={(e) => update("q", e.target.value)}
                placeholder="Search vehicles"
              />
            </div>
          </label>
          <label>
            Make
            <select
              value={value("make")}
              onChange={(e) => update("make", e.target.value)}
            >
              <option value="">All makes</option>
              {[...new Set(cars.map((c) => c.make))].map((m) => (
                <option key={m}>{m}</option>
              ))}
            </select>
          </label>
          <label>
            Condition
            <select
              value={value("condition")}
              onChange={(e) => update("condition", e.target.value)}
            >
              <option value="">All conditions</option>
              {["Brand new", "Foreign used", "Nigerian used"].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
          <label>
            Year
            <select
              value={value("year")}
              onChange={(e) => update("year", e.target.value)}
            >
              <option value="">All years</option>
              {[...new Set(cars.map((c) => c.year))]
                .sort((a, b) => b - a)
                .map((y) => (
                  <option key={y}>{y}</option>
                ))}
            </select>
          </label>
          <label>
            Maximum price (₦)
            <input
              type="number"
              min="0"
              step="1000000"
              placeholder="Any budget"
              value={value("max")}
              onChange={(e) => update("max", e.target.value)}
            />
          </label>
          <button className="reset" onClick={() => setParams({})}>
            Clear all filters
          </button>
        </aside>
        <div>
          <div className="results-top">
            <span>
              {matches.length} vehicle{matches.length !== 1 ? "s" : ""}
            </span>
            <select
              aria-label="Sort vehicles"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="latest">Newest year</option>
              <option value="low">Price: low to high</option>
              <option value="high">Price: high to low</option>
            </select>
          </div>
          {loading ? (
            <p role="status">Opening the showroom…</p>
          ) : error ? (
            <p role="alert">
              We couldn’t load the vehicles. Please refresh to try again.
            </p>
          ) : matches.length ? (
            <div className="car-grid two">
              {matches.map((c) => (
                <Card key={c.id} car={c} />
              ))}
            </div>
          ) : (
            <div className="empty">
              <Search size={36} />
              <h3>No vehicles match just yet.</h3>
              <p>
                Try a different make or a wider budget, or let us help source
                your car.
              </p>
              <button className="button dark" onClick={() => setParams({})}>
                Reset search
              </button>
            </div>
          )}
          <Sourcing query={params.toString()} />
        </div>
      </div>
    </main>
  );
}
function Detail() {
  const { id } = useParams();
  const { cars, loading, currency, rates } = useContext(Data);
  const car = cars.find((c) => c.id === id);
  const [index, setIndex] = useState(0);
  useEffect(() => setIndex(0), [id]);
  if (loading) return <main className="shell section">Loading vehicle…</main>;
  if (!car) return <NotFound />;
  return (
    <main className="shell section">
      <Link className="back-link" to="/inventory">
        <ChevronLeft size={17} />
        Back to inventory
      </Link>
      <div className="detail-grid">
        <div>
          <div className="gallery">
            <img
              src={car.images[index]}
              alt={`${car.make} ${car.model}, image ${index + 1}`}
            />
            {car.images.length > 1 && (
              <div className="gallery-controls">
                <button
                  aria-label="Previous photo"
                  onClick={() =>
                    setIndex(
                      (index - 1 + car.images.length) % car.images.length,
                    )
                  }
                >
                  <ChevronLeft />
                </button>
                <span>
                  {index + 1} / {car.images.length}
                </span>
                <button
                  aria-label="Next photo"
                  onClick={() => setIndex((index + 1) % car.images.length)}
                >
                  <ChevronRight />
                </button>
              </div>
            )}
          </div>
          <div className="detail-description">
            <h3>A closer look.</h3>
            <p>{car.description}</p>
            <span className="eyebrow">FEATURE HIGHLIGHTS</span>
            <ul className="feature-list">
              {car.features.map((f) => (
                <li key={f}>
                  <Check size={17} />
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="detail-summary">
          <span className="eyebrow">
            {car.year} · {car.condition}
          </span>
          <h1>
            {car.make}
            <br />
            {car.model}
          </h1>
          <strong className="detail-price">
            {currencyService.format(car.price, currency, rates)}
          </strong>
          {currency !== "NGN" && (
            <p>Indicative conversion. Final price quoted in NGN.</p>
          )}
          <dl>
            {[
              ["Year", car.year],
              ["Condition", car.condition],
              ["Body style", car.bodyStyle],
              ["Exterior", car.color],
              ["Seats", car.seats],
              ["Stock reference", car.id],
            ].map(([k, v]) => (
              <div key={k}>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
          <a
            className="button"
            href={carEnquiry(car)}
            target="_blank"
            rel="noreferrer"
          >
            <MessageCircle size={18} />
            Enquire on WhatsApp
          </a>
          <Link
            className="button outline"
            to={`/contact?car=${encodeURIComponent(car.year + " " + car.make + " " + car.model)}`}
          >
            Arrange an inspection
          </Link>
          <p className="fine">
            {config.demo
              ? "Sample listing and price for demonstration."
              : "Contact our team to confirm current availability."}
          </p>
        </div>
      </div>
    </main>
  );
}
function About() {
  return (
    <main>
      <section className="shell section about-intro">
        <span className="eyebrow">ABOUT {config.name.toUpperCase()}</span>
        <h1>
          A better car buying
          <br />
          experience starts
          <br />
          with <em>you.</em>
        </h1>
        <div className="about-columns">
          <p>
            Whether you’re choosing your first car, upgrading for family life or
            searching for something special, your next vehicle should suit the
            way you live.
          </p>
          <p>
            At {config.name}, we help you explore new and pre-owned vehicles,
            arrange a closer look and move forward with the information you
            need.
          </p>
        </div>
      </section>
      <img
        className="about-wide"
        src={config.aboutImage}
        alt="A vehicle presented in a spacious showroom"
      />
      <section className="shell section">
        <div className="section-title">
          <div>
            <span className="eyebrow">OUR APPROACH</span>
            <h2>
              Good cars.
              <br />
              Clear conversations.
            </h2>
          </div>
        </div>
        <div className="principles">
          {[
            [
              "01",
              "We listen first.",
              "Tell us what matters: your budget, your needs and the cars you love.",
            ],
            [
              "02",
              "You take a closer look.",
              "Get vehicle details, arrange an inspection and ask your questions.",
            ],
            [
              "03",
              "We help with the next step.",
              "Buying, selling or sourcing — speak directly with our team.",
            ],
          ].map(([n, t, p]) => (
            <article key={n}>
              <span>{n}</span>
              <h3>{t}</h3>
              <p>{p}</p>
            </article>
          ))}
        </div>
        <Link to="/contact" className="button dark">
          Meet your next car
        </Link>
      </section>
    </main>
  );
}
const services = [
  [
    "01",
    "Buy a car.",
    "Browse new and pre-owned vehicles, compare your options and ask our team for details.",
    "Explore inventory",
    "/inventory",
  ],
  [
    "02",
    "Sell your car.",
    "Share your vehicle details and photos. We’ll discuss its condition and the next steps with you.",
    "Start your submission",
    "/sell-your-car",
  ],
  [
    "03",
    "Find something specific.",
    "Have a particular make or model in mind? Tell us what you’re looking for and your budget.",
    "Talk to our team",
    "whatsapp",
  ],
  [
    "04",
    "Take a closer look.",
    "Arrange a visit to see the vehicle, check the details and decide in your own time.",
    "Book an inspection",
    "/contact",
  ],
];
function Services() {
  const [open, setOpen] = useState(0);
  return (
    <main className="shell section">
      <div className="page-intro">
        <span className="eyebrow">HOW WE CAN HELP</span>
        <h1>
          Your next move,
          <br />
          made simpler.
        </h1>
        <p>Buying, selling or still looking. Start here.</p>
      </div>
      <div className="services-list">
        {services.map(([n, t, p, cta, url], i) => (
          <article key={n} className={open === i ? "expanded" : ""}>
            <button
              onClick={() => setOpen(open === i ? -1 : i)}
              aria-expanded={open === i}
            >
              <span>{n}</span>
              <h2>{t}</h2>
              {open === i ? <Minus /> : <Plus />}
            </button>
            {open === i && (
              <div className="service-body">
                <p>{p}</p>
                {url === "whatsapp" ? (
                  <WhatsApp
                    message={`Hello ${config.name}, I'd like help sourcing a vehicle.`}
                  >
                    {cta}
                  </WhatsApp>
                ) : (
                  <Link className="button dark" to={url}>
                    {cta}
                  </Link>
                )}
              </div>
            )}
          </article>
        ))}
      </div>
    </main>
  );
}
function Field({ label, children, ...props }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children || <input {...props} />}
    </label>
  );
}
function Contact() {
  const [params] = useSearchParams();
  const [status, setStatus] = useState(""),
    [busy, setBusy] = useState(false);
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const result = await enquiryService.submit(
        Object.fromEntries(new FormData(e.currentTarget)),
      );
      setStatus(result.message);
    } catch {
      setStatus("Unable to process your enquiry. Please try again.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="shell section">
      <div className="page-intro">
        <span className="eyebrow">LET’S TALK</span>
        <h1>
          It starts with
          <br />a conversation.
        </h1>
      </div>
      <div className="contact-grid">
        <div className="contact-info">
          <h3>Visit. Call. Say hello.</h3>
          <a href={`tel:${config.phone}`}>
            <Phone />
            {config.phone}
          </a>
          <a href={`mailto:${config.email}`}>{config.email}</a>
          <p>
            <MapPin size={19} />
            {config.address}
          </p>
          <p>
            <CalendarDays size={19} />
            {config.hours}
          </p>
          <WhatsApp
            message={`Hello ${config.name}, I'd like to enquire about a vehicle.`}
          />
          <a
            className="text-link"
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(config.address)}`}
            target="_blank"
            rel="noreferrer"
          >
            Open directions
          </a>
        </div>
        <form className="form-panel" onSubmit={submit}>
          <h3>
            {params.get("car")
              ? "Arrange an inspection"
              : "What can we help with?"}
          </h3>
          <p>Share your details and your preferred next step.</p>
          <div className="form-grid">
            <Field
              label="Full name *"
              name="name"
              required
              autoComplete="name"
            />
            <Field
              label="Phone number *"
              name="phone"
              type="tel"
              required
              autoComplete="tel"
            />
            <Field
              label="Email *"
              name="email"
              type="email"
              required
              autoComplete="email"
            />
            <Field label="I’m interested in">
              <select
                name="interest"
                defaultValue={params.get("car") ? "Inspection" : "Buying a car"}
              >
                {[
                  "Buying a car",
                  "Inspection",
                  "Selling a car",
                  "Sourcing a car",
                ].map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
            </Field>
          </div>
          <Field label="Your message *">
            <textarea
              name="message"
              rows="4"
              required
              defaultValue={
                params.get("car")
                  ? `I'd like to inspect the ${params.get("car")}. My preferred date is `
                  : ""
              }
            />
          </Field>
          <p className="fine">
            Demo form: details are not sent or stored. Use WhatsApp for the
            enquiry flow.
          </p>
          <button disabled={busy} className="button dark">
            {busy ? "Preparing…" : "Preview enquiry"}
          </button>
          {status && (
            <p className="form-status" role="status">
              <Check size={18} />
              {status}
            </p>
          )}
        </form>
      </div>
    </main>
  );
}
function Sell() {
  const [files, setFiles] = useState([]),
    [error, setError] = useState(""),
    [status, setStatus] = useState(""),
    [busy, setBusy] = useState(false);
  const previewUrls = useRef([]);
  useEffect(
    () => () => previewUrls.current.forEach((url) => URL.revokeObjectURL(url)),
    [],
  );
  function choose(e) {
    const list = Array.from(e.target.files);
    if (
      list.length > 6 ||
      list.some(
        (f) =>
          !["image/jpeg", "image/png", "image/webp"].includes(f.type) ||
          f.size > 5 * 1024 * 1024,
      )
    ) {
      setError("Choose up to 6 JPG, PNG or WebP photos, each under 5 MB.");
      return;
    }
    setError("");
    setFiles(
      list.map((file) => {
        const url = URL.createObjectURL(file);
        previewUrls.current.push(url);
        return { file, url };
      }),
    );
  }
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const result = await enquiryService.submit({
        ...Object.fromEntries(new FormData(e.currentTarget)),
        photos: files.map((f) => f.file),
      });
      setStatus(result.message);
    } catch {
      setStatus("Unable to prepare the submission. Please try again.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="shell section">
      <div className="page-intro">
        <span className="eyebrow">PASS THE KEYS ON</span>
        <h1>
          Your car’s
          <br />
          next chapter.
        </h1>
        <p>
          Tell us about yourself and your car. Let’s start with the details.
        </p>
      </div>
      <form className="sell-form form-panel" onSubmit={submit}>
        <div className="form-heading">
          <span>01</span>
          <h3>A little about you.</h3>
        </div>
        <div className="form-grid">
          <Field label="Full name *" name="name" required autoComplete="name" />
          <Field
            label="Phone number *"
            name="phone"
            type="tel"
            required
            autoComplete="tel"
          />
          <Field
            label="Email *"
            name="email"
            type="email"
            required
            autoComplete="email"
          />
          <Field
            label="Location *"
            name="location"
            required
            placeholder="City / state"
          />
        </div>
        <div className="form-heading">
          <span>02</span>
          <h3>Now, your car.</h3>
        </div>
        <div className="form-grid">
          <Field
            label="Make *"
            name="make"
            required
            placeholder="e.g. Toyota"
          />
          <Field
            label="Model *"
            name="model"
            required
            placeholder="e.g. Camry"
          />
          <Field
            label="Year *"
            name="year"
            required
            type="number"
            min="1900"
            max={new Date().getFullYear() + 1}
          />
          <Field label="Condition *">
            <select name="condition" required>
              <option value="">Select condition</option>
              <option>Brand new</option>
              <option>Foreign used</option>
              <option>Nigerian used</option>
            </select>
          </Field>
          <Field
            label="Asking price (₦) *"
            name="price"
            type="number"
            min="1"
            required
          />
          <Field label="Exterior colour" name="color" />
        </div>
        <Field label="Tell us more">
          <textarea
            rows="4"
            name="description"
            placeholder="Ownership history, documents available, features and any known issues."
          />
        </Field>
        <div className="form-heading">
          <span>03</span>
          <h3>A few good angles.</h3>
        </div>
        <label className="upload-zone">
          <Upload />
          <strong>Add photos of your car</strong>
          <span>Up to 6 photos · JPG, PNG, WebP · 5 MB each</span>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            onChange={choose}
          />
        </label>
        {error && (
          <p role="alert" className="error">
            {error}
          </p>
        )}
        <div className="photo-previews">
          {files.map((f, i) => (
            <div key={f.url}>
              <img src={f.url} alt={`Vehicle upload preview ${i + 1}`} />
              <button
                type="button"
                aria-label={`Remove photo ${i + 1}`}
                onClick={() => setFiles(files.filter((_, n) => n !== i))}
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
        <label className="consent">
          <input type="checkbox" required />I confirm these details are accurate
          and agree to be contacted about this vehicle.
        </label>
        <p className="fine">
          Demo preview: your details and photos remain in this page and are not
          uploaded or sent.
        </p>
        <button className="button dark" disabled={busy}>
          {busy ? "Preparing…" : "Preview submission"}
        </button>
        {status && (
          <p role="status" className="form-status">
            <Check size={18} />
            {status}
          </p>
        )}
      </form>
    </main>
  );
}
function NotFound() {
  return (
    <main className="shell section empty">
      <span className="eyebrow">404</span>
      <h1>A different road.</h1>
      <p>We couldn’t find that page or vehicle.</p>
      <Link className="button dark" to="/inventory">
        Back to inventory
      </Link>
    </main>
  );
}
export default function App() {
  const [cars, setCars] = useState([]),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(false),
    [currency, setCurrency] = useState("NGN"),
    [rates, setRates] = useState({ NGN: 1 });
  const location = useLocation();
  useEffect(() => {
    inventoryService
      .list()
      .then(setCars)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
    currencyService
      .rates()
      .then(setRates)
      .catch(() => setCurrency("NGN"));
    for (const [key, value] of Object.entries(config.colors))
      document.documentElement.style.setProperty(`--${key}`, value);
    document.title = `${config.name} | ${config.tagline}`;
  }, []);
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [location.pathname]);
  return (
    <Data.Provider
      value={{ cars, loading, error, currency, setCurrency, rates }}
    >
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Header />
      <div id="main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/inventory/:id" element={<Detail />} />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<Services />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/sell-your-car" element={<Sell />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
      <Footer />
    </Data.Provider>
  );
}
