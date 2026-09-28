import EmptyState from "../common/EmptyState";

export default function AdminEmptyState({ icon, title, description, action }) {
  return <EmptyState icon={icon} title={title} description={description} action={action} />;
}
