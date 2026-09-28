import CategoryCard from "../cards/CategoryCard";

export default function CategoryScroller({ categories }) {
  return (
    <div className="scroll-rail">
      {categories.map((cat) => (
        <CategoryCard key={cat.id} category={cat} />
      ))}
    </div>
  );
}
