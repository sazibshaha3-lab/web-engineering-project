import SectionHeader from "../common/SectionHeader";
import RestaurantCard from "../cards/RestaurantCard";

export default function RestaurantSection({ title, description, restaurants, linkTo, linkLabel, tone }) {
  return (
    <section className={tone === "highlight" ? "restaurant-section restaurant-section--highlight" : "restaurant-section"}>
      <SectionHeader title={title} description={description} linkTo={linkTo} linkLabel={linkLabel} />
      <div className="grid grid--restaurants">
        {restaurants.map((r) => (
          <RestaurantCard key={r.id} restaurant={r} />
        ))}
      </div>
    </section>
  );
}
