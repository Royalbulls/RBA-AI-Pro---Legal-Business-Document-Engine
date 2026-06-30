import { DocumentParams } from "../types";

export interface TemplatePreset {
  title: string;
  description: string;
  fields: Partial<DocumentParams>;
}

export const INDUSTRY_CATEGORIES = [
  "SaaS & AI Technology",
  "E-Commerce & Digital Retail",
  "Creative & Marketing Agency",
  "Professional Advisory & Consulting",
  "Finance & Capital Investment"
] as const;

export type IndustryCategory = typeof INDUSTRY_CATEGORIES[number];

export const PURPOSE_TEMPLATES: Record<IndustryCategory, Record<string, TemplatePreset[]>> = {
  "SaaS & AI Technology": {
    "NDA": [
      {
        title: "AI Engine Optimization",
        description: "For evaluating deep-learning algorithms & LLM API fine-tuning.",
        fields: {
          purpose: "Evaluating potential technical collaboration regarding fine-tuning proprietary Large Language Models, hosting private vector databases, and custom NLP API implementations.",
          info_type: "Proprietary source code, weight checkpoints, neural architectures, data preprocessing pipelines, training dataset structures, API credentials, and internal engineering roadmaps.",
          duration: "5 Years",
          jurisdiction: "New Delhi, India"
        }
      },
      {
        title: "Cloud Infrastructure Setup",
        description: "For discussing multi-tenant SaaS hosting, Kubernetes & DevOps.",
        fields: {
          purpose: "Discussing prospective architectural consulting and management for a multi-region cloud deployment, container orchestration, cyber-security audits, and continuous-delivery pipelines.",
          info_type: "Infrastructure charts, secret keys, IAM configuration files, zero-trust network diagrams, server monitoring metrics, and software build dependency logs.",
          duration: "3 Years",
          jurisdiction: "Bengaluru, Karnataka"
        }
      }
    ],
    "500 Plus Agreement": [
      {
        title: "Strategic Payment Alliance",
        description: "High-value cross-licensing and core infrastructure joint venture.",
        fields: {
          purpose: "Establishing an omnibus master corporate alliance for co-developing real-time payment authentication middleware, API integrations, and multi-bank transactional settlement nodes.",
          special_notes: "Subject to stringent PCI-DSS compliance specifications. Section 5.1 includes cross-licensing of core settlement ledgers. Section 12 details a rolling service-credit clawback penalty up to 5% of monthly recurring transaction revenue, plus automated arbitration forums under SIAC or MCIA rules.",
          duration: "7 Years",
          jurisdiction: "Mumbai, Maharashtra"
        }
      },
      {
        title: "Enterprise AI Distribution",
        description: "Omnibus licensing and professional services contract.",
        fields: {
          purpose: "Structuring a multi-party enterprise software distribution, cloud reseller channel, and machine learning customized integration framework globally.",
          special_notes: "Covers intellectual property transfer of downstream custom adapters, multi-tenant resource quota isolation agreements, escalation matrix SLAs for Tier-3 outages within 2 hours, and detailed non-solicit covenants of deep technical research scientists.",
          duration: "5 Years",
          jurisdiction: "New Delhi, India"
        }
      }
    ],
    "Client Service Agreement": [
      {
        title: "AI SaaS Platform Dev",
        description: "Full-cycle SaaS architecture, design & deploy SLA.",
        fields: {
          service: "Provision of full-stack engineering services, including UI/UX wireframing, building scalable backend APIs, React dashboard development, integrating stripe payments, setup of automated database backups, and hosting on auto-scaling servers.",
          payment: "Fixed retention fee of INR 1,50,000 per month, invoiced on the 1st of every calendar month with a net-10 payment cycle.",
          duration: "12 Months milestone-based contract"
        }
      }
    ],
    "Freelancer/Agent Agreement": [
      {
        title: "Senior AI Researcher Sprints",
        description: "Contracting technical developers for model training tasks.",
        fields: {
          service: "Conducting neural network hyperparameter tuning, cleaning high-dimensional training datasets, synthesizing evaluations, and compiling performance benchmarking summaries.",
          payment: "Flat milestone payout of INR 2,250 per hour capped at 120 hours per month, invoiced bi-weekly upon pull request integrations.",
          duration: "6 Months Renewing Term"
        }
      }
    ],
    "Website Terms & Conditions": [
      {
        title: "B2B SaaS Portal Platform",
        description: "Multi-tenant cloud portal terms of use.",
        fields: {
          services: "Cloud-hosted productivity dashboard, database syncing automations, team workspace sharing tools, and data analytics export services available at subdomains of the platform website."
        }
      }
    ],
    "Privacy Policy": [
      {
        title: "SaaS Application Consent",
        description: "Complete list of cloud cookie and API trackers.",
        fields: {
          data_types: "Encrypted login credentials, usage statistics (IP addresses, device metadata), telemetry cookies, third-party authentication profiles (Google, GitHub), and stripe session checkout IDs."
        }
      }
    ],
    "Investor Pitch Legal Disclaimer": [
      {
        title: "AI Startup Deck Safe Harbor",
        description: "Disclaiming hardware & training model risks.",
        fields: {
          purpose: "Private presentation of pre-seed funding plans, GPU infrastructure expansion pipelines, and future generative-AI research projections to qualified private institutional investors.",
          jurisdiction: "Bangalore, India"
        }
      }
    ],
    "Digital Marketing Compliance Policy": [
      {
        title: "Algorithmic Ad Retargeting",
        description: "Tech company rules on browser tracking & pixel tags.",
        fields: {
          platform: "Facebook Pixel, Google AdSense, LinkedIn Insight Tag, and automated behavioral SMS triggers.",
          jurisdiction: "Indian IT Rules 2021 & Digital Personal Data Protection (DPDP) Act 2023"
        }
      }
    ],
    "Founder Agreement": [
      {
        title: "Tech Startup Launch split",
        description: "For cofounders building an AI product.",
        fields: {
          equity_split: "48% CTO (Technical Lead), 48% CEO (Business & Capital), 4% ESOP Pool allocation",
          roles: "CTO manages complete technical design, software development pipelines, and IP creations. CEO leads marketing, raises investor funds, and manages strategic hiring and HR.",
          vesting: "4-year vesting timeline with an initial 1-year cliff, vesting monthly thereafter.",
          decision_rules: "Unanimous approval required for capital spend exceeding INR 5,00,000 or modification of core business incorporation shares.",
          exit_terms: "Right of first refusal (ROFR) applies. If a founder resigns before 2 years, they must sell vested shares back to founders at fair market value value."
        }
      }
    ],
    "Shareholder Agreement": [
      {
        title: "Tech Cap Table Controls",
        description: "Tag-along / drag-along protection clauses.",
        fields: {
          shareholders: "Lead Investor Fund (20%), Founder A (40%), Founder B (40%)",
          share_distribution: "Class-A Voting Common Shares distributed proportionally to direct capital investments."
        }
      }
    ],
    "Offer Letter": [
      {
        title: "Lead AI/ML Dev Offer",
        description: "Hiring engineering talent.",
        fields: {
          position: "Lead Artificial Intelligence & Machine Learning Architect",
          salary: "INR 28,00,000 per annum (fixed component: 85%, performance bonus: 15%)"
        }
      }
    ],
    "Referral Partner Agreement": [
      {
        title: "API Affiliate Integration",
        description: "Partner rewards for developer signups.",
        fields: {
          service: "Promotion of cloud API subscription plans using custom link tracking, developer tutorials, and blog posts.",
          payment: "20% recurring monthly commission on referee spend for up to 12 months after primary signup.",
          duration: "Renewing 1-year affiliate status"
        }
      }
    ],
    "Pitch Deck": [
      {
        title: "Generative AI Platform Outline",
        description: "Structuring market slides.",
        fields: {
          problem: "Enterprises waste millions of engineering hours manually fine-tuning language models for customer compliance issues.",
          solution: "Our no-code fine-tuning workspace enables automated corporate alignment checks in under 15 minutes.",
          market: "Total Addressable Market (TAM) of USD 12 Billion in Enterprise Legal Ops globally.",
          revenue: "B2B Annual Subscription ranging from USD 15,000 to USD 80,000 depending on volume of prompt validations."
        }
      }
    ],
    "Financial Model": [
      {
        title: "AWS/GPU Cloud Expense",
        description: "Major computing projections.",
        fields: {
          revenue_streams: "Enterprise API Subscription (Monthly recurring), Custom Consulting Implementation contracts.",
          costs: "GPU Cloud cluster lease, high-bandwidth server costs, security engineers, marketing PPC spends."
        }
      }
    ],
    "Application Letter": [
      {
        title: "Incubation Space Request",
        description: "Applying for government technical grants.",
        fields: {
          purpose: "Permission and subsidy support for securing 12 desks in the state-sponsored Deep Technology Incubation Center.",
          authority: "The Director of Information Technology & Innovation, Government of India Hub"
        }
      }
    ]
  },
  "E-Commerce & Digital Retail": {
    "NDA": [
      {
        title: "White-Label Supplier NDA",
        description: "For private label formulas and vendor supply chains.",
        fields: {
          purpose: "Evaluating candidate contract manufacturers and bulk suppliers for proprietary skincare cosmetics and organic formulas.",
          info_type: "Active chemical formulations, testing results, packaging designs, price sheets, supplier directories, and product release calendars.",
          duration: "3 Years",
          jurisdiction: "Chennai, Tamil Nadu"
        }
      }
    ],
    "500 Plus Agreement": [
      {
        title: "Multi-Warehouse fulfillment SLA",
        description: "Omnibus national shipping and inventory agreement.",
        fields: {
          purpose: "Structuring a pan-India automated logistics routing, custom fulfillment, delivery, and reverse warehousing network.",
          special_notes: "Requires real-time electronic data interchange (EDI) API sync. Section 8 details tight visual inspection standards where damaged packaging over 1% of total monthly shipments results in a penalty of 1.5x product wholesale cost. Dispute resolution via fast-track arbitration.",
          duration: "5 Years",
          jurisdiction: "Mumbai, Maharashtra"
        }
      }
    ],
    "Client Service Agreement": [
      {
        title: "Inventory Sync Integration",
        description: "Shopify / WooCommerce CRM dashboard setup.",
        fields: {
          service: "Installing, mapping and custom configuring Shopify POS systems with offline warehouse ERP databases, optimizing checkout load times, and training local stock managers.",
          payment: "Flat milestone payments: 40% advance payment, 40% on API stabilization, and 20% post testing verification.",
          duration: "3 Months implementation window"
        }
      }
    ],
    "Freelancer/Agent Agreement": [
      {
        title: "Digital Photography Shoot",
        description: "Commercial product catalog generation.",
        fields: {
          service: "Professional editing, lighting setup, styled product photography for 120 stock keeping units (SKUs), and uploading high-res raw images to company Google Drive folders.",
          payment: "Flat contract compensation of INR 95,000, payable upon final approval of all mockups.",
          duration: "30 Days from inventory delivery"
        }
      }
    ],
    "Website Terms & Conditions": [
      {
        title: "E-Commerce Retail Store",
        description: "Standard checkout, refund & delivery guidelines.",
        fields: {
          services: "Online digital catalog, secure credit card and UPI gateway processing, home parcel delivery arrangements, and exchange/refund support workflows."
        }
      }
    ],
    "Privacy Policy": [
      {
        title: "Cart Recovery Optimization",
        description: "Disclosing tracking pixels and shopper browser context.",
        fields: {
          data_types: "Shipping address, billing details, phone number, saved cart contents, clickstream drop-off timestamps, and automated discount marketing codes."
        }
      }
    ],
    "Investor Pitch Legal Disclaimer": [
      {
        title: "Direct-to-Consumer Growth Deck",
        description: "For brand expansions seeking growth capital.",
        fields: {
          purpose: "Capital presentation disclosing historical customer acquisition costs (CAC), lifetime value ratios (LTV), inventory turn rates, and private expansion planning projections.",
          jurisdiction: "New Delhi, India"
        }
      }
    ],
    "Digital Marketing Compliance Policy": [
      {
        title: "SMS Flash Sale Alerts",
        description: "Mandated guidelines for promotional SMS & DND registers.",
        fields: {
          platform: "Transactional Gateway SMS, WhatsApp Broadcasts, and promotional email blasts.",
          jurisdiction: "TRAI regulations and Consumer Protection E-Commerce Rules (India)"
        }
      }
    ],
    "Founder Agreement": [
      {
        title: "D2C Brand Partnership",
        description: "For founders starting an online store.",
        fields: {
          equity_split: "50% Creative Director, 50% Tech & Operations Architect",
          roles: "Creative Director owns design, marketing, sourcing, and social media. Operations Architect owns inventory sync, warehouse contracts, tax returns, and customer service.",
          vesting: "3-year rolling vesting cycle with an initial 6-month cliff.",
          decision_rules: "Decisions regarding inventory purchases over INR 2,00,000 or modification of shipping rates require mutual approval.",
          exit_terms: "Custom buyout option structure: leaving cofounder can be bought out over 12 equal monthly installments to protect treasury cashflow."
        }
      }
    ],
    "Shareholder Agreement": [
      {
        title: "D2C Retail Seed Round",
        description: "For angel investments in private retail brands.",
        fields: {
          shareholders: "Angel Syndicate A (15%), Founder A (42.5%), Founder B (42.5%)",
          share_distribution: "Class-A preferred shares issued to angel syndicate with liquidation preference of 1x."
        }
      }
    ],
    "Offer Letter": [
      {
        title: "Store Logistics Manager",
        description: "Hiring warehouse supervisors.",
        fields: {
          position: "Chief Warehouse & Fulfillment Manager",
          salary: "INR 8,50,000 per annum with a performance-tied bonus based on inventory turn goals."
        }
      }
    ],
    "Referral Partner Agreement": [
      {
        title: "Lifestyle Content Affiliates",
        description: "Referral terms for fashion/lifestyle blogs.",
        fields: {
          service: "Posting digital banners on blogs, reviewing specific beauty products, and distributing unique influencer coupon codes.",
          payment: "10% commission on the net sales price of all qualified checkouts utilizing the referral partner's custom link.",
          duration: "6 Months renewable contract"
        }
      }
    ],
    "Pitch Deck": [
      {
        title: "Private Skincare Brand Growth",
        description: "Pitching retail expansion slides.",
        fields: {
          problem: "Organic cosmetic options in major retail markets contain harmful synthetic additives or are excessively priced.",
          solution: "We supply direct-to-consumer premium organic cosmetics manufactured locally, slashing supply lines and prices.",
          market: "The rapidly growing Indian organic cosmetic market is valued at USD 1.8 Billion annually.",
          revenue: "Direct retail e-commerce transactions and rolling wholesale store partnerships."
        }
      }
    ],
    "Financial Model": [
      {
        title: "D2C Apparel Projections",
        description: "Major distribution & inventory logs.",
        fields: {
          revenue_streams: "Direct Webstore sales, Amazon Seller marketplace checkout revenue.",
          costs: "Dyes & fabric sourcing, warehouse leases, third-party logistics courier fees, social media customer Acquisition Spends (CAC)."
        }
      }
    ],
    "Application Letter": [
      {
        title: "Exhibition Stall Allocation",
        description: "Applying for retail festival space.",
        fields: {
          purpose: "Permission and allotment of a 3m x 3m premium trade booth at the upcoming National Handloom and Startup Retail Expo.",
          authority: "The Secretary, State Commerce and Textiles Development Board"
        }
      }
    ]
  },
  "Creative & Marketing Agency": {
    "NDA": [
      {
        title: "Campaign Creative NDA",
        description: "Protecting brand concepts and unreleased video assets.",
        fields: {
          purpose: "Sharing prospective summer marketing campaign concepts, slogans, and TV commercial draft storyboards for collaborative feedback.",
          info_type: "Pre-launch advertising slogans, graphic designs, script documents, video footage, trademark applications, and influencer contract fees.",
          duration: "2 Years",
          jurisdiction: "Mumbai, Maharashtra"
        }
      }
    ],
    "500 Plus Agreement": [
      {
        title: "Brand Ambassador Contract",
        description: "Omnibus celebrity or high-level influencer engagement.",
        fields: {
          purpose: "Structuring an omnibus exclusive representation, brand endorsement, digital modeling, and media broadcasting alliance.",
          special_notes: "Includes absolute non-disparagement covenants. Section 6 holds strict 'Morals Clause' where public updates bringing disrepute trigger immediate termination without payout. Section 9 outlines clear royalty allocations on co-branded merchandise lines.",
          duration: "24 Months"
        }
      }
    ],
    "Client Service Agreement": [
      {
        title: "Continuous SEO & Brand PR",
        description: "Ongoing reputation builder and blogger outreach.",
        fields: {
          service: "Conducting search engine optimization (SEO), writing weekly corporate blogs, managing Instagram and LinkedIn ad accounts, and publishing 3 guest press releases.",
          payment: "INR 1,20,000 monthly retainer, billed net-15 on invoice receipt.",
          duration: "6 Months rolling retainer"
        }
      }
    ],
    "Freelancer/Agent Agreement": [
      {
        title: "Creative Storyboard Artist",
        description: "Engaging freelance animators.",
        fields: {
          service: "Drawing 12 episodic digital storyboards for a high-concept marketing film series, responding to creative director revisions.",
          payment: "Flat price of INR 8,000 per finalized storyboard illustration board.",
          duration: "45 Days project duration"
        }
      }
    ],
    "Website Terms & Conditions": [
      {
        title: "Design Portfolio & Blog",
        description: "Terms of use for media templates and graphic design portal.",
        fields: {
          services: "Web design gallery, downloadable mockups, corporate marketing blogs, and contact consultation intake dashboards."
        }
      }
    ],
    "Privacy Policy": [
      {
        title: "Agency Contact Form Tracking",
        description: "Simple, compliant cookie disclosure.",
        fields: {
          data_types: "Name, business email address, corporate telephone number, marketing goals questionnaire responses, and referral origin logs."
        }
      }
    ],
    "Investor Pitch Legal Disclaimer": [
      {
        title: "Agency Roll-Up Venture Deck",
        description: "For marketing holding group mergers.",
        fields: {
          purpose: "Confidential review of joint agency financials, consolidated growth projections, asset acquisitions, and potential expansion structures.",
          jurisdiction: "Mumbai, Maharashtra"
        }
      }
    ],
    "Digital Marketing Compliance Policy": [
      {
        title: "Sponsored Post Disclosures",
        description: "Indian ASCI code compliance parameters for media campaigns.",
        fields: {
          platform: "Instagram Reels, YouTube Sponsored Videos, and LinkedIn sponsored content.",
          jurisdiction: "ASCI Influencer Advertising Guidelines & Consumer Protection Act 2019"
        }
      }
    ],
    "Founder Agreement": [
      {
        title: "Marketing Agency Partnership",
        description: "Cofounder agreement for creative studio.",
        fields: {
          equity_split: "50% Lead Strategist, 50% Creative Director",
          roles: "Lead Strategist drives client generation, finances, legal contracts, and SEO operations. Creative Director leads UI design, copy production, video shoots, and client deliverables.",
          vesting: "3-year vesting timeline with no initial cliff, vesting monthly.",
          decision_rules: "Major credit defaults or client retainers below INR 50,000 can be signed by either partner; larger commitments require joint signatures.",
          exit_terms: "Non-compete clause: a departing partner cannot pitch or serve active agency clients for a period of 12 months post-exit."
        }
      }
    ],
    "Shareholder Agreement": [
      {
        title: "Ad Agency Shareholders Setup",
        description: "Standard joint venture details.",
        fields: {
          shareholders: "Partner A (50%), Partner B (50%)",
          share_distribution: "Class-A ordinary voting equity distributed equally between founders."
        }
      }
    ],
    "Offer Letter": [
      {
        title: "Graphic Designer Offer",
        description: "Welcoming creative staff.",
        fields: {
          position: "Lead UI/UX Graphic and Motion Designer",
          salary: "INR 12,00,000 per annum with a performance-tied bonus based on client task completions."
        }
      }
    ],
    "Referral Partner Agreement": [
      {
        title: "Client Referral Affiliates",
        description: "Partner rewards for introducing corporate clients.",
        fields: {
          service: "Introducing enterprise retail leads seeking complete corporate branding and PR packages.",
          payment: "Flat bonus of 10% on the first 3 monthly retainer invoices cleared by the referred corporate client.",
          duration: "12 Months rolling term"
        }
      }
    ],
    "Pitch Deck": [
      {
        title: "Performance Ads Studio",
        description: "Pitching pitch deck slides.",
        fields: {
          problem: "Most design agencies build pretty websites that fail to convert direct search visitors into high-paying buyers.",
          solution: "Our studio integrates behavioral psychology analytics with high-speed performance designs that guarantee a 2x boost in conversion rates.",
          market: "Global enterprise performance advertising spend exceeds USD 240 Billion annually.",
          revenue: "Base implementation project fees paired with a 15% revenue share bonus on incremental sales conversions."
        }
      }
    ],
    "Financial Model": [
      {
        title: "Agency Payroll & Software Projections",
        description: "Major monthly cost forecasts.",
        fields: {
          revenue_streams: "Brand retainer agreements, SEO monthly optimization programs, digital product asset checklist sales.",
          costs: "Designer salaries, Adobe Creative Suite enterprise licensing, high-end design hardware lease, Google/Facebook Ads PPC test spends."
        }
      }
    ],
    "Application Letter": [
      {
        title: "Media Pass Allotment",
        description: "Applying for film festival access.",
        fields: {
          purpose: "Allotment of 4 Premium Press Media passes for full coverage of the state international film conference.",
          authority: "The Media & Credentials Committee Chairman"
        }
      }
    ]
  },
  "Professional Advisory & Consulting": {
    "NDA": [
      {
        title: "Financial Restructuring NDA",
        description: "Protecting balance sheets and internal audit notes.",
        fields: {
          purpose: "Analyzing corporate balance sheet health, asset valuations, tax disclosures, and strategic debt refinance frameworks.",
          info_type: "Debt ledger worksheets, tax filings, legal dispute histories, intellectual property portfolios, audit statements, and employee restructuring plans.",
          duration: "5 Years",
          jurisdiction: "New Delhi, India"
        }
      }
    ],
    "500 Plus Agreement": [
      {
        title: "Executive Search & Equity Fee",
        description: "Omnibus management advisory and retainer package.",
        fields: {
          purpose: "Structuring a executive leadership recruitment, market strategy consultation, and advisory joint-venture.",
          special_notes: "Includes multi-tier placement warranty clauses (free replacement if executive resigns within 180 days). Section 8 sets forth a custom equity option grant schedule vesting over 24 months, subject to standard non-disclosure checks.",
          duration: "3 Years"
        }
      }
    ],
    "Client Service Agreement": [
      {
        title: "Management Strategy Blueprint",
        description: "For systems auditing & operations consulting.",
        fields: {
          service: "Conducting dynamic workflow audits, mapping CRM systems, documenting standard operating procedures (SOPs), and advising C-suite leaders on talent models.",
          payment: "Flat consulting project fee of INR 4,50,000, split into 3 payments of INR 1,50,000 each linked to milestone deliveries.",
          duration: "6 Months non-renewing consulting term"
        }
      }
    ],
    "Freelancer/Agent Agreement": [
      {
        title: "Associate Financial Analyst",
        description: "Outsourcing tax and accounting tasks.",
        fields: {
          service: "Compiling Excel balance sheets, resolving state GST tax filing statements, and preparing draft tax defense petitions under executive oversight.",
          payment: "INR 35,000 flat monthly salary, payable within 5 days of monthly invoice checkoffs.",
          duration: "Client-project tied duration (approx 6 months)"
        }
      }
    ],
    "Website Terms & Conditions": [
      {
        title: "Consultant Advisory Portal",
        description: "User terms & information disclaimer.",
        fields: {
          services: "Industry analysis whitepapers, booking strategy advisory slots, and subscribing to newsletters."
        }
      }
    ],
    "Privacy Policy": [
      {
        title: "Advisory Booking Intake Privacy",
        description: "Disclosing collection of corporate background information.",
        fields: {
          data_types: "Name, phone, corporate email domain, financial size metrics, business bottlenecks, and session recordings."
        }
      }
    ],
    "Investor Pitch Legal Disclaimer": [
      {
        title: "Private Equity Advisory Deck",
        description: "Standard warnings for debt restructuring.",
        fields: {
          purpose: "Strategic presentation showing target buy-ins, debt refinance forecasts, and operational efficiency projection metrics to private credit lenders.",
          jurisdiction: "Mumbai, India"
        }
      }
    ],
    "Digital Marketing Compliance Policy": [
      {
        title: "Professional Certification Ads",
        description: "Rules for showing consulting credentials.",
        fields: {
          platform: "Google Search Ads, LinkedIn Sponsored Messages, and advisory landing pages.",
          jurisdiction: "Consumer Protection Guidelines & SEBI Investment Advisor codes if applicable"
        }
      }
    ],
    "Founder Agreement": [
      {
        title: "Advisory Firm Co-Founding",
        description: "Cofounder agreement for consulting partners.",
        fields: {
          equity_split: "50% Lead Consultant, 50% Client Relations Architect",
          roles: "Lead Consultant leads technical deliverables, reports, client audits, and curriculum. Client Relations Architect drives outreach, B2B cold pitching, contracts, and finance.",
          vesting: "Partner equity vested equally over 36 months, with an initial 1-year lock-in.",
          decision_rules: "Unanimous partner approval required for legal litigation filing or hiring direct full-time advisors.",
          exit_terms: "departing partner cannot contact active consulting clients for a period of 18 months post-exit."
        }
      }
    ],
    "Shareholder Agreement": [
      {
        title: "Consultancy equity partners",
        description: "Partner buy-in terms.",
        fields: {
          shareholders: "Managing Partner A (40%), Managing Partner B (40%), Junior Partner C (20%)",
          share_distribution: "Ordinary shares issued with custom dividend payouts linked to business unit profit performance."
        }
      }
    ],
    "Offer Letter": [
      {
        title: "Corporate Legal Advisor",
        description: "Hiring in-house legal experts.",
        fields: {
          position: "Lead Associate - Corporate Legal & Taxation Affairs",
          salary: "INR 15,00,000 per annum with standard health benefits and performance-tied bonus."
        }
      }
    ],
    "Referral Partner Agreement": [
      {
        title: "Consulting Case Referrals",
        description: "B2B client referral system.",
        fields: {
          service: "Referring corporate mid-market companies seeking restructuring audits and strategy reviews.",
          payment: "8% of the total first-year project value, payable upon clearance of client milestone payments.",
          duration: "1 Year renewing term"
        }
      }
    ],
    "Pitch Deck": [
      {
        title: "Operations Optimization Suite",
        description: "Advisory pitch slides.",
        fields: {
          problem: "Mid-market manufacturing industries waste up to 18% of operating margin due to legacy supply-chain bottlenecks and unoptimized inventory routes.",
          solution: "Our automated operations audits catalog bottleneck nodes in 10 days, presenting actionable blueprints that save 10x our fee.",
          market: "Total Addressable Market of domestic mid-market manufacturing consultancies exceeds USD 3 Billion in India.",
          revenue: "Fixed diagnostic audit fee paired with a 20% bonus linked to documented cost-saving metrics."
        }
      }
    ],
    "Financial Model": [
      {
        title: "Consulting Payroll & Travel Projects",
        description: "Advisory cashflow projections.",
        fields: {
          revenue_streams: "Audit implementation fees, ongoing executive coaching retainers, strategy document checklist sales.",
          costs: "Associate salaries, corporate travel & hotel spends, high-speed documentation databases, B2B sales automation pipelines."
        }
      }
    ],
    "Application Letter": [
      {
        title: "Tax Exemption Certificate Request",
        description: "Applying for tax waiver.",
        fields: {
          purpose: "Application and document filing for verification and issuance of GST tax exemption certificate under Section 12-A.",
          authority: "The Commissioner of Central Goods and Service Taxes & Audit Forum"
        }
      }
    ]
  },
  "Finance & Capital Investment": {
    "NDA": [
      {
        title: "Pre-Due Diligence NDA",
        description: "Protecting private ledger books and shareholder logs.",
        fields: {
          purpose: "Conducting technical audits and capital ledger reviews in anticipation of a Series-A equity investment round.",
          info_type: "Cap tables, investor correspondence, product algorithms, employee salary registers, tax returns, and 3-year audit ledgers.",
          duration: "3 Years",
          jurisdiction: "Mumbai, Maharashtra"
        }
      }
    ],
    "500 Plus Agreement": [
      {
        title: "Structured Debt & Warrants",
        description: "Omnibus capital injection and convertible notes contract.",
        fields: {
          purpose: "Structuring a high-value private structured debt, share pledge warrant, and technical security advisory alliance.",
          special_notes: "Subject to strict financial covenants (e.g., maintaining a debt-to-equity ratio of at least 1.5). Section 9 defines share convertible option formulas with an anti-dilution floor of 12% if subsequent rounds down-price.",
          duration: "5 Years"
        }
      }
    ],
    "Client Service Agreement": [
      {
        title: "Wealth Advisory Arrangement",
        description: "Asset compliance and investment monitoring setup.",
        fields: {
          service: "Ongoing assessment of high-yield bonds, analyzing corporate tax exposure, managing trust funds, and presenting quarterly audit compliance summaries.",
          payment: "0.75% per annum fee of total Assets Under Management (AUM), billed net-30 at the end of each calendar quarter.",
          duration: "Rolling 2-year advisory term"
        }
      }
    ],
    "Freelancer/Agent Agreement": [
      {
        title: "Contract Risk Underwriter",
        description: "Outsourcing mortgage or investment checks.",
        fields: {
          service: "Examining financial histories, reviewing land deeds, verifying loan compliance histories, and writing risk evaluation reports.",
          payment: "INR 12,000 per completed high-value commercial underwriting evaluation report.",
          duration: "3 Months contract"
        }
      }
    ],
    "Website Terms & Conditions": [
      {
        title: "Investment Platform Terms",
        description: "Wealth intake portal disclaimer and user terms.",
        fields: {
          services: "Wealth trackers, private venture capital directories, simulated asset calculators, and financial newsletters."
        }
      }
    ],
    "Privacy Policy": [
      {
        title: "KYC/AML Data Privacy Policy",
        description: "Disclosing collection of government tax IDs.",
        fields: {
          data_types: "PAN card number, bank statement records, identity cards, transaction histories, digital signature certificates, and IP location logs."
        }
      }
    ],
    "Investor Pitch Legal Disclaimer": [
      {
        title: "Series-A Equity Deck Disclaimer",
        description: "Strict SEC/SEBI safe harbor warnings.",
        fields: {
          purpose: "Private capital allocation review, presenting historic year-on-year growth margins, and forward-looking financial performance estimates.",
          jurisdiction: "Mumbai, Maharashtra, India"
        }
      }
    ],
    "Digital Marketing Compliance Policy": [
      {
        title: "Wealth Management Promotion",
        description: "Rules for marketing financial products.",
        fields: {
          platform: "Google Search Ads, LinkedIn Sponsored Content, financial blogs, and SMS alert lists.",
          jurisdiction: "SEBI Advertising Codes & RBI Guidelines for Wealth Platforms"
        }
      }
    ],
    "Founder Agreement": [
      {
        title: "Fintech Fund Co-Founding",
        description: "Cofounder agreement for venture or boutique funds.",
        fields: {
          equity_split: "45% Fund Manager, 45% Tech Architect, 10% Regulatory Partner",
          roles: "Fund Manager leads LP pipeline, asset selections, SEBI compliances, and PR. Tech Architect builds algorithmic engines, trading panels, and secure databases. Regulatory Partner leads compliance and audits.",
          vesting: "Partner equity vested monthly over 4 years with a 1-year cliff.",
          decision_rules: "Decisions regarding capital allocation changes over INR 10,00,000 require unanimous co-founder signatures.",
          exit_terms: "Non-solicit of LP investors: leaving partner cannot solicit fund's limited partners for a period of 24 months post-exit."
        }
      }
    ],
    "Shareholder Agreement": [
      {
        title: "Series-A share class rights",
        description: "Pre-emptive and liquidation rights.",
        fields: {
          shareholders: "Lead Fund (25%), Co-Investors (10%), Founders (65%)",
          share_distribution: "Class-A Preferred shares issued to investors with drag-along voting rights triggered at 66% threshold approvals."
        }
      }
    ],
    "Offer Letter": [
      {
        title: "Investment Analyst Offer",
        description: "Hiring investment managers.",
        fields: {
          position: "Senior Investment Associate - Private Equity & Venture Capital",
          salary: "INR 18,00,000 per annum with a performance bonus linked to portfolio transaction success."
        }
      }
    ],
    "Referral Partner Agreement": [
      {
        title: "Broker Referral Partner",
        description: "Affiliate terms for asset introductions.",
        fields: {
          service: "Introducing Qualified Institutional Buyers (QIB) or High Net-worth Individuals (HNI) seeking private corporate bond listings.",
          payment: "0.25% finder fee on total capital invested, paid within 15 days of transaction closing.",
          duration: "1 Year renewable program"
        }
      }
    ],
    "Pitch Deck": [
      {
        title: "Fintech Algo Fund",
        description: "Pitching structured bond layouts.",
        fields: {
          problem: "Traditional mutual funds present sub-inflation returns, and high-yielding corporate bonds remain restricted to elite broker registries.",
          solution: "Our micro-fractional bond ownership platform pools retail capital, granting instant access to secure, audited 14% yield corporate papers.",
          market: "The private retail wealth management pipeline in India is valued at USD 480 Billion.",
          revenue: "We take an annual asset management fee of 0.8% of the total digital portfolio volume."
        }
      }
    ],
    "Financial Model": [
      {
        title: "Brokerage Transaction Cashflow",
        description: "Projecting brokerage revenues.",
        fields: {
          revenue_streams: "Fractional bond commission charges, API advisory platform subscriptions.",
          costs: "KYC/AML verification gateways, banking escrow setups, financial license insurance premiums, security researchers."
        }
      }
    ],
    "Application Letter": [
      {
        title: "Merchant Banker License Request",
        description: "Applying for financial registration.",
        fields: {
          purpose: "Formal application and document submissions for licensing and registration as a Category-1 Merchant Banker.",
          authority: "The Securities and Exchange Board of India (SEBI) Head Office"
        }
      }
    ]
  }
};
