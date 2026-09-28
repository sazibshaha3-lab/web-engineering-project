// Frontend-only saved delivery addresses used during checkout (Step 4).
// Distinct from the lightweight "deliver to" picker in LocationContext —
// this schema carries the structured fields a real checkout form needs.

export const addressLabels = ["Home", "Hostel", "University", "Mess", "Other"];

export const initialAddresses = [
  {
    id: "addr1",
    label: "Hostel",
    line: "Hostel Block C, Room 214",
    area: "Central Hostel Zone",
    city: "Campus Town",
    details: "Ask the gatekeeper for Block C",
    isDefault: true,
  },
  {
    id: "addr2",
    label: "University",
    line: "CSE Building, 3rd Floor Lab",
    area: "Main Campus",
    city: "Campus Town",
    details: "",
    isDefault: false,
  },
];
