import SectionHeader from "../common/SectionHeader";
import FoodCard from "../cards/FoodCard";

export default function FoodSection({ title, description, foods, linkTo, linkLabel }) {
  return (
    <section className="food-section">
      <SectionHeader title={title} description={description} linkTo={linkTo} linkLabel={linkLabel} />
      <div className="grid grid--foods">
        {foods.map((f) => (
          <FoodCard key={f.id} food={f} />
        ))}
      </div>
    </section>
  );
}
