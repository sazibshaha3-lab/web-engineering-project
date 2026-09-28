import EmptyState from "../common/EmptyState";

export default function RiderEmptyState({ icon, title, description, action }) {
  return <EmptyState icon={icon} title={title} description={description} action={action} />;
}
