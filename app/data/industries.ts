// 3-tier industry hierarchy: Main > Sub > Micro
export interface MicroIndustry {
  id: string;
  name: string;
}

export interface SubIndustry {
  id: string;
  name: string;
  micro: MicroIndustry[];
}

export interface MainIndustry {
  id: string;
  name: string;
  sub: SubIndustry[];
}

export const industries: MainIndustry[] = [
  {
    id: "technology",
    name: "Technology",
    sub: [
      {
        id: "software",
        name: "Software & IT Services",
        micro: [
          { id: "saas", name: "SaaS / Cloud Services" },
          { id: "enterprise-software", name: "Enterprise Software" },
          { id: "mobile-apps", name: "Mobile Applications" },
          { id: "devtools", name: "Developer Tools" },
          { id: "cybersecurity", name: "Cybersecurity" },
        ],
      },
      {
        id: "hardware",
        name: "Hardware & Electronics",
        micro: [
          { id: "semiconductors", name: "Semiconductors" },
          { id: "consumer-electronics", name: "Consumer Electronics" },
          { id: "networking", name: "Networking Equipment" },
          { id: "iot-devices", name: "IoT Devices" },
        ],
      },
      {
        id: "ai-ml",
        name: "AI & Machine Learning",
        micro: [
          { id: "generative-ai", name: "Generative AI" },
          { id: "computer-vision", name: "Computer Vision" },
          { id: "nlp", name: "Natural Language Processing" },
          { id: "mlops", name: "MLOps & Infrastructure" },
        ],
      },
      {
        id: "data",
        name: "Data & Analytics",
        micro: [
          { id: "business-intelligence", name: "Business Intelligence" },
          { id: "data-engineering", name: "Data Engineering" },
          { id: "data-visualization", name: "Data Visualization" },
        ],
      },
    ],
  },
  {
    id: "finance",
    name: "Finance & Banking",
    sub: [
      {
        id: "banking",
        name: "Banking",
        micro: [
          { id: "retail-banking", name: "Retail Banking" },
          { id: "investment-banking", name: "Investment Banking" },
          { id: "commercial-banking", name: "Commercial Banking" },
          { id: "private-banking", name: "Private Banking" },
        ],
      },
      {
        id: "fintech",
        name: "FinTech",
        micro: [
          { id: "payments", name: "Payments & Transfers" },
          { id: "lending", name: "Digital Lending" },
          { id: "neobanks", name: "Neobanks" },
          { id: "crypto", name: "Cryptocurrency & Blockchain" },
        ],
      },
      {
        id: "insurance",
        name: "Insurance",
        micro: [
          { id: "life-insurance", name: "Life Insurance" },
          { id: "health-insurance", name: "Health Insurance" },
          { id: "property-insurance", name: "Property & Casualty" },
          { id: "insurtech", name: "InsurTech" },
        ],
      },
      {
        id: "investment",
        name: "Investment & Asset Management",
        micro: [
          { id: "venture-capital", name: "Venture Capital" },
          { id: "private-equity", name: "Private Equity" },
          { id: "hedge-funds", name: "Hedge Funds" },
          { id: "wealth-management", name: "Wealth Management" },
        ],
      },
    ],
  },
  {
    id: "healthcare",
    name: "Healthcare & Life Sciences",
    sub: [
      {
        id: "pharma",
        name: "Pharmaceuticals",
        micro: [
          { id: "drug-discovery", name: "Drug Discovery" },
          { id: "clinical-trials", name: "Clinical Trials" },
          { id: "generics", name: "Generic Drugs" },
          { id: "biotech", name: "Biotechnology" },
        ],
      },
      {
        id: "healthcare-services",
        name: "Healthcare Services",
        micro: [
          { id: "hospitals", name: "Hospitals & Health Systems" },
          { id: "clinics", name: "Clinics & Outpatient" },
          { id: "telehealth", name: "Telehealth" },
          { id: "mental-health", name: "Mental Health Services" },
        ],
      },
      {
        id: "medtech",
        name: "Medical Technology",
        micro: [
          { id: "medical-devices", name: "Medical Devices" },
          { id: "diagnostics", name: "Diagnostics" },
          { id: "digital-health", name: "Digital Health" },
          { id: "wearables", name: "Health Wearables" },
        ],
      },
    ],
  },
  {
    id: "retail",
    name: "Retail & Consumer",
    sub: [
      {
        id: "ecommerce",
        name: "E-Commerce",
        micro: [
          { id: "marketplaces", name: "Online Marketplaces" },
          { id: "dtc", name: "Direct-to-Consumer" },
          { id: "social-commerce", name: "Social Commerce" },
        ],
      },
      {
        id: "brick-mortar",
        name: "Brick & Mortar",
        micro: [
          { id: "department-stores", name: "Department Stores" },
          { id: "specialty-retail", name: "Specialty Retail" },
          { id: "grocery", name: "Grocery & Supermarkets" },
        ],
      },
      {
        id: "cpg",
        name: "Consumer Packaged Goods",
        micro: [
          { id: "food-beverage", name: "Food & Beverage" },
          { id: "personal-care", name: "Personal Care" },
          { id: "household", name: "Household Products" },
        ],
      },
    ],
  },
  {
    id: "manufacturing",
    name: "Manufacturing & Industrial",
    sub: [
      {
        id: "automotive",
        name: "Automotive",
        micro: [
          { id: "oem", name: "OEM / Vehicle Manufacturers" },
          { id: "auto-parts", name: "Auto Parts & Suppliers" },
          { id: "ev", name: "Electric Vehicles" },
          { id: "autonomous", name: "Autonomous Vehicles" },
        ],
      },
      {
        id: "aerospace",
        name: "Aerospace & Defense",
        micro: [
          { id: "commercial-aviation", name: "Commercial Aviation" },
          { id: "defense-contractors", name: "Defense Contractors" },
          { id: "space", name: "Space & Satellites" },
        ],
      },
      {
        id: "industrial-equipment",
        name: "Industrial Equipment",
        micro: [
          { id: "machinery", name: "Heavy Machinery" },
          { id: "automation", name: "Industrial Automation" },
          { id: "robotics", name: "Robotics" },
        ],
      },
    ],
  },
  {
    id: "energy",
    name: "Energy & Utilities",
    sub: [
      {
        id: "oil-gas",
        name: "Oil & Gas",
        micro: [
          { id: "exploration", name: "Exploration & Production" },
          { id: "refining", name: "Refining & Processing" },
          { id: "distribution", name: "Distribution" },
        ],
      },
      {
        id: "renewables",
        name: "Renewable Energy",
        micro: [
          { id: "solar", name: "Solar" },
          { id: "wind", name: "Wind" },
          { id: "battery-storage", name: "Battery & Storage" },
          { id: "hydrogen", name: "Hydrogen" },
        ],
      },
      {
        id: "utilities",
        name: "Utilities",
        micro: [
          { id: "electric-utilities", name: "Electric Utilities" },
          { id: "water", name: "Water & Wastewater" },
          { id: "gas-utilities", name: "Gas Utilities" },
        ],
      },
    ],
  },
  {
    id: "media",
    name: "Media & Entertainment",
    sub: [
      {
        id: "digital-media",
        name: "Digital Media",
        micro: [
          { id: "streaming", name: "Streaming Services" },
          { id: "social-media", name: "Social Media" },
          { id: "digital-publishing", name: "Digital Publishing" },
          { id: "podcasting", name: "Podcasting" },
        ],
      },
      {
        id: "gaming",
        name: "Gaming",
        micro: [
          { id: "video-games", name: "Video Games" },
          { id: "mobile-gaming", name: "Mobile Gaming" },
          { id: "esports", name: "Esports" },
        ],
      },
      {
        id: "traditional-media",
        name: "Traditional Media",
        micro: [
          { id: "film-tv", name: "Film & Television" },
          { id: "music", name: "Music" },
          { id: "publishing", name: "Publishing" },
          { id: "advertising", name: "Advertising & Marketing" },
        ],
      },
    ],
  },
  {
    id: "real-estate",
    name: "Real Estate",
    sub: [
      {
        id: "residential",
        name: "Residential",
        micro: [
          { id: "single-family", name: "Single Family" },
          { id: "multifamily", name: "Multifamily" },
          { id: "proptech-residential", name: "PropTech - Residential" },
        ],
      },
      {
        id: "commercial-re",
        name: "Commercial Real Estate",
        micro: [
          { id: "office", name: "Office" },
          { id: "retail-re", name: "Retail" },
          { id: "industrial-re", name: "Industrial & Logistics" },
        ],
      },
      {
        id: "reits",
        name: "REITs & Investment",
        micro: [
          { id: "equity-reits", name: "Equity REITs" },
          { id: "mortgage-reits", name: "Mortgage REITs" },
          { id: "re-development", name: "Real Estate Development" },
        ],
      },
    ],
  },
  {
    id: "professional-services",
    name: "Professional Services",
    sub: [
      {
        id: "consulting",
        name: "Consulting",
        micro: [
          { id: "management-consulting", name: "Management Consulting" },
          { id: "it-consulting", name: "IT Consulting" },
          { id: "strategy-consulting", name: "Strategy Consulting" },
          { id: "hr-consulting", name: "HR Consulting" },
        ],
      },
      {
        id: "legal",
        name: "Legal",
        micro: [
          { id: "law-firms", name: "Law Firms" },
          { id: "legaltech", name: "LegalTech" },
          { id: "corporate-legal", name: "Corporate Legal" },
        ],
      },
      {
        id: "accounting",
        name: "Accounting & Tax",
        micro: [
          { id: "big-four", name: "Big Four Accounting" },
          { id: "tax-services", name: "Tax Services" },
          { id: "audit", name: "Audit Services" },
        ],
      },
    ],
  },
  {
    id: "education",
    name: "Education",
    sub: [
      {
        id: "higher-ed",
        name: "Higher Education",
        micro: [
          { id: "universities", name: "Universities" },
          { id: "community-colleges", name: "Community Colleges" },
          { id: "online-degrees", name: "Online Degree Programs" },
        ],
      },
      {
        id: "edtech",
        name: "EdTech",
        micro: [
          { id: "lms", name: "Learning Management Systems" },
          { id: "online-courses", name: "Online Courses & MOOCs" },
          { id: "tutoring", name: "Tutoring Platforms" },
          { id: "assessment", name: "Assessment & Testing" },
        ],
      },
      {
        id: "k12",
        name: "K-12 Education",
        micro: [
          { id: "public-schools", name: "Public Schools" },
          { id: "private-schools", name: "Private Schools" },
          { id: "charter-schools", name: "Charter Schools" },
        ],
      },
    ],
  },
  {
    id: "logistics",
    name: "Transportation & Logistics",
    sub: [
      {
        id: "freight",
        name: "Freight & Shipping",
        micro: [
          { id: "trucking", name: "Trucking" },
          { id: "rail", name: "Rail Freight" },
          { id: "ocean-shipping", name: "Ocean Shipping" },
          { id: "air-freight", name: "Air Freight" },
        ],
      },
      {
        id: "last-mile",
        name: "Last Mile & Delivery",
        micro: [
          { id: "parcel", name: "Parcel Delivery" },
          { id: "food-delivery", name: "Food Delivery" },
          { id: "courier", name: "Courier Services" },
        ],
      },
      {
        id: "supply-chain",
        name: "Supply Chain",
        micro: [
          { id: "warehousing", name: "Warehousing" },
          { id: "fulfillment", name: "Fulfillment Centers" },
          { id: "supply-chain-tech", name: "Supply Chain Tech" },
        ],
      },
    ],
  },
  {
    id: "hospitality",
    name: "Hospitality & Travel",
    sub: [
      {
        id: "hotels",
        name: "Hotels & Lodging",
        micro: [
          { id: "luxury-hotels", name: "Luxury Hotels" },
          { id: "budget-hotels", name: "Budget Hotels" },
          { id: "vacation-rentals", name: "Vacation Rentals" },
        ],
      },
      {
        id: "travel",
        name: "Travel & Tourism",
        micro: [
          { id: "airlines", name: "Airlines" },
          { id: "travel-agencies", name: "Travel Agencies" },
          { id: "cruise", name: "Cruise Lines" },
          { id: "travel-tech", name: "Travel Tech" },
        ],
      },
      {
        id: "food-service",
        name: "Food Service",
        micro: [
          { id: "restaurants", name: "Restaurants" },
          { id: "qsr", name: "Quick Service / Fast Food" },
          { id: "catering", name: "Catering" },
        ],
      },
    ],
  },
];

export const jobRoles = [
  { id: "board-member", name: "Board Members" },
  { id: "c-level", name: "C Level Execs" },
  { id: "vp-level", name: "VP Level Execs" },
  { id: "director", name: "Directors" },
  { id: "manager", name: "Managers" },
  { id: "non-manager", name: "Non Managers" },
];
