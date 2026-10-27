import { Link, useParams } from "react-router-dom";
import { ArrowRight, Mail, FileText, HelpCircle, Users, Building2 } from "lucide-react";
import PageHeader from "../../components/common/PageHeader";
import Button from "../../components/common/Button";
import "./CompanyPage.css";

const pages = {
  about: {
    title: "About CampusEats",
    description: "CampusEats connects students with nearby campus restaurants and mess kitchens.",
    icon: Building2,
    body: "Browse menus, add dishes to your cart, place an order, and follow delivery progress from the kitchen to your door.",
    action: { to: "/customer/restaurants", label: "Browse restaurants" },
  },
  careers: {
    title: "Careers at CampusEats",
    description: "Interested in working with our team?",
    icon: Users,
    body: "There are no job listings published here yet. For career enquiries, email our support team and include “Careers” in the subject.",
    emailSubject: "Careers enquiry",
  },
  help: {
    title: "Help centre",
    description: "Find your way around CampusEats or contact support.",
    icon: HelpCircle,
    body: "Browse restaurants without an account. You can add food to your cart, then log in or create a customer account at checkout. To see an existing order, open your order history.",
    action: { to: "/customer/restaurants", label: "Browse restaurants" },
    secondaryAction: { to: "/customer/orders", label: "Track an order" },
  },
  terms: {
    title: "Terms of Service",
    description: "The CampusEats terms page is not published yet.",
    icon: FileText,
    body: "Please contact support for current service terms. This page will be updated when the finalized terms are available.",
    emailSubject: "Terms of Service question",
  },
  privacy: {
    title: "Privacy notice",
    description: "The CampusEats privacy notice is not published yet.",
    icon: FileText,
    body: "Please contact support with privacy questions. This page will be updated when the finalized privacy notice is available.",
    emailSubject: "Privacy question",
  },
};

export default function CompanyPage({ page: pageProp }) {
  const params = useParams();
  const page = pageProp || params.page || "about";
  const content = pages[page] || pages.about;

  return (
    <div className="company-page container fade-in">
      <PageHeader icon={content.icon} title={content.title} description={content.description} />
      <section className="company-page__card">
        <p>{content.body}</p>
        <div className="company-page__actions">
          {content.action && (
            <Button as={Link} to={content.action.to} variant="primary" icon={ArrowRight} iconPosition="right">
              {content.action.label}
            </Button>
          )}
          {content.secondaryAction && (
            <Button as={Link} to={content.secondaryAction.to} variant="secondary">
              {content.secondaryAction.label}
            </Button>
          )}
          {content.emailSubject && (
            <Button
              as="a"
              href={`mailto:support@campuseats.app?subject=${encodeURIComponent(content.emailSubject)}`}
              variant="secondary"
              icon={Mail}
            >
              Email support
            </Button>
          )}
        </div>
        {page === "careers" && (
          <p className="company-page__note">Looking to deliver instead? <Link to="/register" state={{ role: "rider" }}>Apply as a rider</Link>.</p>
        )}
      </section>
    </div>
  );
}
