/*
  Roy Nyamiaka: portfolio content
  -------------------------------------------------------------
  Everything on the site comes from this one file.
  The easiest way to change it is the editor: open /admin.html on your site.
  If you edit by hand, keep the data below valid JSON
  (double quotes, no trailing commas).
  Tip: writing {years} in any text shows your years of experience,
  counted from profile.careerStart.
*/
window.PORTFOLIO = {
  "meta": {
    "schema": 1,
    "updated": "2026-11-23"
  },
  "settings": {
    "siteUrl": "https://ngareroy.github.io/roy-portfolio/",
    "accent": "#3E6B52",
    "defaultTheme": "auto",
    "currency": {
      "code": "KES",
      "usdRate": 129,
      "showUsdToggle": true
    },
    "form": {
      "provider": "formsubmit",
      "email": "royngare@gmail.com",
      "web3formsKey": "",
      "formspreeId": "",
      "netlifyFormName": "quote",
      "subject": "New enquiry from your portfolio"
    },
    "editor": {
      "mode": "github",
      "owner": "ngareroy",
      "repo": "roy-portfolio",
      "branch": "main"
    }
  },
  "profile": {
    "name": "Roy Nyamiaka",
    "fullName": "Royallans Nyamiaka",
    "title": "ICT Administrator & Web Systems Developer",
    "headline": "I build websites and school systems, keep IT running for schools and businesses, and set teams up with AI.",
    "intro": "Based in Malindi on the Kenyan coast. On-site across Kilifi County, remote anywhere.",
    "summary": [
      "I'm a hands-on ICT professional with {years}+ years of experience keeping networks, servers, devices and users running. As ICT Administrator at The Learning Hub School in Malindi, I manage the school's IT infrastructure, user support, access control, backups and endpoint security. I developed the school management system the school uses, where teachers record and analyse results and parents view and track progress, and I'm now building a transport tracking app that links parents with the school's transport section.",
      "I also build and look after websites. I developed and maintain The Learning Hub School's website, and built the website for FRENA, a community organization, working with both to improve their SEO and business profiles. For FRENA I also set up and registered their domain, transferred their website and set up professional email. At the school I set up Google Workspace, created staff emails and trained staff to use it.",
      "Since 2020 I have worked remotely as a data analyst for CloudFactory, doing data, image and video analysis for AI and machine-learning projects. I hold a BSc in Computer Security and Forensics and an ISO/IEC 27001 Information Security Associate credential, so security and data protection are part of everything I build."
    ],
    "careerStart": "2020-01",
    "location": "Malindi, Kilifi County, Kenya",
    "workModes": ["On-site in Malindi & Kilifi County", "Remote, anywhere"],
    "email": "royngare@gmail.com",
    "phone": "+254 708 061 237",
    "whatsapp": "254708061237",
    "photo": "",
    "cvPdf": "assets/docs/Royallans-Nyamiaka-CV.pdf",
    "availability": {
      "status": "available",
      "label": "Available for roles, contracts and on-demand IT work"
    },
    "nationality": "Kenyan",
    "languages": [
      { "name": "English", "level": "Fluent" },
      { "name": "Kiswahili", "level": "Fluent" }
    ],
    "socials": [
      { "label": "LinkedIn", "url": "" },
      { "label": "GitHub", "url": "" },
      { "label": "X", "url": "" },
      { "label": "Facebook", "url": "" },
      { "label": "Instagram", "url": "" },
      { "label": "TikTok", "url": "" }
    ],
    "facts": [
      { "value": "{years}+", "label": "years of professional IT and data experience" },
      { "value": "2", "label": "organisation websites built and maintained" },
      { "value": "ISO 27001", "label": "Information Security Associate" },
      { "value": "BSc", "label": "Computer Security and Forensics" }
    ],
    "focusAreas": [
      "Websites",
      "School systems",
      "SEO & business profiles",
      "Domains & email",
      "Google Workspace",
      "IT support",
      "Data analysis",
      "AI setup & training"
    ],
    "highlights": [
      "Developed The Learning Hub School's management system: teachers record and analyse results, and parents view and track progress",
      "Building a transport tracking app that links parents with the school's transport section and tracks learners' journeys",
      "Built and maintain the websites of FRENA and The Learning Hub School, including SEO, business profiles, domain and professional email",
      "Set up Google Workspace for The Learning Hub School and trained staff to use it",
      "{years} years of remote data, image and video analysis for AI/ML projects at CloudFactory",
      "Valid Certificate of Good Conduct, committed to safeguarding and confidentiality"
    ],
    "workedWith": ["The Learning Hub School", "FRENA", "CloudFactory", "Global Forensics Services", "Moi University"],
    "additional": [
      "Valid Certificate of Good Conduct (Police Clearance) available",
      "Committed to safeguarding and confidentiality",
      "Referees available on request"
    ]
  },
  "serviceGroups": [
    {
      "id": "build",
      "title": "Build",
      "blurb": "Websites, web apps and systems made to fit how you work."
    },
    {
      "id": "design-test",
      "title": "Design & test",
      "blurb": "Screens people understand, checked before your users find the bugs."
    },
    {
      "id": "support",
      "title": "Run & support",
      "blurb": "Networks, devices and accounts that stay up, secure and backed up."
    },
    {
      "id": "grow",
      "title": "Grow & enable",
      "blurb": "Get found online, make sense of your data and put AI to work."
    }
  ],
  "services": [
    {
      "id": "websites",
      "group": "build",
      "title": "Website design & development",
      "summary": "Responsive, mobile-first websites and landing pages: designed, built, launched and looked after.",
      "details": "From a one-page profile to a multi-page organisation or school website. I built and maintain the websites of FRENA, a community organization, and The Learning Hub School. I handle design, page structure, build, contact forms and basic SEO, then keep the site maintained or hand it over with training.",
      "deliverables": [
        "Custom design that fits your brand",
        "Mobile-first, fast-loading pages",
        "Contact and WhatsApp forms, maps and social links",
        "Basic SEO and analytics setup",
        "Training on updating your content"
      ],
      "tags": ["Responsive", "Mobile-first", "Landing pages", "SEO-ready"],
      "skills": ["Web development (responsive, mobile-first)", "SEO setup", "Website maintenance"]
    },
    {
      "id": "web-apps",
      "group": "build",
      "title": "Web app development",
      "summary": "Custom web apps, portals and dashboards built around the way your team works.",
      "details": "Internal tools, client portals and dashboards backed by a properly designed database. I map your workflow first, then build, test and deploy securely, with documentation your team can follow.",
      "deliverables": [
        "Requirements and workflow mapping",
        "Database design",
        "Logins and role-based access control",
        "Testing and secure deployment",
        "Documentation and handover"
      ],
      "tags": ["Databases", "Systems analysis", "Access control"],
      "skills": ["Web app development", "Database development & administration", "Systems analysis & design"]
    },
    {
      "id": "school-systems",
      "group": "build",
      "title": "School management systems",
      "summary": "Results, records and parent progress tracking in one system: designed, implemented and supported.",
      "details": "I developed the school management system The Learning Hub School uses: teachers record and analyse results, and parents view and track progress. I'm now building a transport tracking app that links parents with the school's transport section and tracks learners' journeys. I can build a system for your school, bring your existing records in and train your staff.",
      "deliverables": [
        "Results recording and analysis for teachers",
        "Parent access to view and track progress",
        "Student records",
        "Data migration from Excel or paper",
        "Staff training and ongoing support",
        "Transport tracking app (in development)"
      ],
      "tags": ["MIS", "Databases", "Reporting", "Data protection"],
      "skills": ["MIS development", "Database development & administration", "Reporting & records management"]
    },
    {
      "id": "ai-dev",
      "group": "build",
      "title": "AI-assisted development",
      "summary": "Apps, automations and internal tools delivered faster with AI coding tools, and tested by a human.",
      "details": "I use AI-assisted development tools to prototype and build faster; I used them for the school management system at The Learning Hub School. The parts that matter stay in human hands: requirements, testing, security and data protection.",
      "deliverables": [
        "Rapid prototypes to test ideas",
        "Workflow automations",
        "Internal tools and scripts",
        "Review and testing of AI-written code"
      ],
      "tags": ["AI tools", "Automation", "Prototyping"],
      "skills": ["AI-assisted development", "Workflow automation"]
    },
    {
      "id": "ux-testing",
      "group": "design-test",
      "title": "UI/UX design & testing",
      "summary": "Wireframes, prototypes and usability tests that make apps and websites easier to use.",
      "details": "I map how people use your product, design clear screens and test them with real users, then give you findings you can act on, in priority order.",
      "deliverables": [
        "User flows and wireframes",
        "Clickable prototypes",
        "Usability testing sessions",
        "UX review with prioritised fixes"
      ],
      "tags": ["UX", "Prototyping", "Usability"],
      "skills": ["UI/UX design", "Usability testing"]
    },
    {
      "id": "app-testing",
      "group": "design-test",
      "title": "App & website testing (QA)",
      "summary": "Functional, cross-device and usability testing with clear, reproducible bug reports.",
      "details": "Before a launch or after an update, I test your app or website the way your users will: on different phones, browsers and connections. Every issue comes with steps to reproduce, screenshots and a severity rating.",
      "deliverables": [
        "Test plan and checklists",
        "Android, iOS and browser testing",
        "Bug reports with steps and screenshots",
        "Retesting after fixes"
      ],
      "tags": ["QA", "Android", "iOS", "Cross-browser"],
      "skills": ["App & website testing (QA)", "Usability testing"]
    },
    {
      "id": "it-support",
      "group": "support",
      "title": "IT support & administration",
      "summary": "Networks, servers, devices, user accounts, backups and endpoint security, kept running and secure.",
      "details": "The same work I do every day for a school that relies on confidential records: infrastructure management, user accounts and access control, backups, antivirus and endpoint protection, all with data protection in mind.",
      "deliverables": [
        "Network setup and administration (LAN/WAN, Wi-Fi)",
        "User accounts and access permissions",
        "Backups and recovery planning",
        "Antivirus and endpoint protection",
        "Microsoft 365 and Google Workspace administration"
      ],
      "tags": ["Networking", "Windows", "Linux", "Microsoft 365", "Google Workspace"],
      "skills": [
        "IT infrastructure management",
        "Networking (TCP/IP, LAN/WAN, Wi-Fi)",
        "User accounts & access management",
        "Backups & endpoint security",
        "Microsoft 365",
        "Google Workspace"
      ]
    },
    {
      "id": "workspace",
      "group": "support",
      "title": "Google Workspace setup & training",
      "summary": "Google Workspace set up for your school or organisation: staff emails, a working environment and hands-on staff training.",
      "details": "I set up Google Workspace for The Learning Hub School, created the staff email accounts, set up the working environment and trained staff to use it. I can do the same for your school, business or organisation.",
      "deliverables": [
        "Google Workspace setup for your organisation",
        "Staff email accounts",
        "Shared drives, groups and permissions",
        "Staff training",
        "Follow-up support"
      ],
      "tags": ["Google Workspace", "Professional email", "Training"],
      "skills": [
        "Google Workspace",
        "User accounts & access management",
        "Business email setup",
        "Staff training & digital literacy"
      ]
    },
    {
      "id": "troubleshooting",
      "group": "support",
      "title": "Software & hardware troubleshooting",
      "summary": "Slow, broken or infected computers, printers and networks diagnosed and fixed.",
      "details": "Installs, upgrades, driver problems, crashes, malware, failing drives and lost files. I find the real cause, fix it, and tell you how to avoid it next time.",
      "deliverables": [
        "Diagnosis and repair",
        "Operating system installs and upgrades",
        "Virus and malware removal",
        "Hardware upgrades (SSD, RAM)",
        "Data recovery"
      ],
      "tags": ["Hardware", "Software", "Data recovery"],
      "skills": [
        "Hardware & software troubleshooting",
        "Digital forensics & data recovery",
        "Antivirus & endpoint protection"
      ]
    },
    {
      "id": "ict-on-demand",
      "group": "support",
      "title": "ICT support on demand",
      "summary": "A call-out or remote session when something breaks, or a monthly plan so it breaks less.",
      "details": "For businesses and schools without a full-time IT person: book a one-off visit or remote session, or put your devices and network on a monthly plan with regular check-ups and priority response.",
      "deliverables": [
        "On-site call-outs in Malindi and Kilifi County",
        "Remote support sessions",
        "Monthly support plans",
        "Preventive maintenance check-ups"
      ],
      "tags": ["On-site", "Remote", "Monthly plans"],
      "skills": ["IT support & troubleshooting", "Server & device maintenance"]
    },
    {
      "id": "business-online",
      "group": "grow",
      "title": "Business online setup",
      "summary": "Google Business Profile, social pages, website, business email and SEO, so customers can find you.",
      "details": "I set up and connect everything an organisation needs to look credible online, as I did for FRENA and The Learning Hub School: website, SEO, business profile, domain and professional email. Then I keep it maintained.",
      "deliverables": [
        "Google Business Profile setup and improvement",
        "Social media business pages",
        "Professional email on your own domain",
        "SEO setup (Search Console, sitemap, on-page)",
        "Website maintenance"
      ],
      "tags": ["Google Business", "SEO", "Email", "Social media"],
      "skills": ["Business online profiles", "SEO setup", "Website maintenance", "Business email setup"]
    },
    {
      "id": "domains",
      "group": "grow",
      "title": "Domains & hosting",
      "summary": "Domain setup, registration and transfers (.co.ke, .com and more), website transfers, DNS and professional email.",
      "details": "Register a new domain, transfer an existing one, move your website to a new host, and get DNS and email records right, as I did for FRENA.",
      "deliverables": [
        "Domain search, setup and registration",
        "Domain and website transfers",
        "DNS and email records (MX, SPF, DKIM)",
        "Hosting setup and migration",
        "Renewal reminders"
      ],
      "tags": [".co.ke", ".com", "DNS", "Hosting"],
      "skills": ["Domain registration & transfer", "DNS & hosting", "Business email setup"]
    },
    {
      "id": "data-analysis",
      "group": "grow",
      "title": "Data analysis",
      "summary": "Clean, analyse and visualise your data, then turn it into reports people use.",
      "details": "{years} years of data analysis and quality work on AI/ML projects, plus reporting systems for school records. I clean messy spreadsheets, find what the numbers say and build dashboards and reports.",
      "deliverables": [
        "Data cleaning and quality checks",
        "Analysis and interpretation",
        "Dashboards and reports",
        "Data labelling and annotation"
      ],
      "tags": ["Excel", "Google Sheets", "Reporting", "Data quality"],
      "skills": ["Data analysis & interpretation", "Data quality assurance", "Reporting & records management"]
    },
    {
      "id": "ai-training",
      "group": "grow",
      "title": "AI setup, training & support",
      "summary": "Get your team using AI tools safely and productively: setup, training and follow-up support.",
      "details": "I set up AI assistants for your team, write simple usage guidelines that respect data protection, and run hands-on training for staff at any skill level. The training builds on the digital-literacy course I designed and teach.",
      "deliverables": [
        "AI tool selection and setup",
        "Usage guidelines and data-protection basics",
        "Hands-on staff training",
        "Prompt libraries for everyday tasks",
        "Follow-up support"
      ],
      "tags": ["AI tools", "Training", "Digital literacy"],
      "skills": ["AI tools setup & support", "Staff training & digital literacy"]
    }
  ],
  "skills": [
    {
      "id": "infra",
      "title": "IT infrastructure & support",
      "items": [
        "IT infrastructure management",
        "IT support & troubleshooting",
        "Networking (TCP/IP, LAN/WAN, Wi-Fi)",
        "Server & device maintenance",
        "Hardware & software troubleshooting",
        "User accounts & access management"
      ]
    },
    {
      "id": "security",
      "title": "Security & data protection",
      "items": [
        "Backups & endpoint security",
        "Antivirus & endpoint protection",
        "ISO/IEC 27001 information security",
        "Data protection & confidentiality (Kenya DPA)",
        "Digital forensics & data recovery"
      ]
    },
    {
      "id": "dev",
      "title": "Development & systems",
      "items": [
        "Web development (responsive, mobile-first)",
        "Web app development",
        "Mobile app development (Android, iOS)",
        "Database development & administration",
        "MIS development",
        "Systems analysis & design",
        "Systems integration",
        "AI-assisted development"
      ]
    },
    {
      "id": "design",
      "title": "Design & testing",
      "items": ["UI/UX design", "Usability testing", "App & website testing (QA)"]
    },
    {
      "id": "data",
      "title": "Data",
      "items": [
        "Data analysis & interpretation",
        "Data quality assurance",
        "Reporting & records management",
        "Image & video analysis"
      ]
    },
    {
      "id": "ai",
      "title": "AI, automation & training",
      "items": ["AI tools setup & support", "Workflow automation", "Staff training & digital literacy"]
    },
    {
      "id": "web-presence",
      "title": "Web presence",
      "items": [
        "Domain registration & transfer",
        "DNS & hosting",
        "Business email setup",
        "SEO setup",
        "Business online profiles",
        "Website maintenance"
      ]
    },
    {
      "id": "platforms",
      "title": "Platforms",
      "items": ["Windows", "Linux/Unix", "Microsoft 365", "Google Workspace"]
    }
  ],
  "projects": [
    {
      "id": "school-management-system",
      "cover": "Results & progress",
      "title": "School Management System",
      "client": "The Learning Hub School, Malindi",
      "period": "",
      "status": "completed",
      "statusNote": "In daily use",
      "category": "School systems",
      "featured": true,
      "summary": "A school management system where teachers record and analyse results, and parents view and track their children's progress.",
      "features": [
        "Teachers record learners' results",
        "Results analysis for teachers",
        "Parents view and track progress"
      ],
      "challenge": "",
      "approach": "",
      "outcome": "",
      "role": "Developer",
      "stack": [],
      "skills": [
        "MIS development",
        "Database development & administration",
        "Web app development",
        "Reporting & records management"
      ],
      "services": ["school-systems"],
      "links": [],
      "images": []
    },
    {
      "id": "school-transport-app",
      "cover": "Transport",
      "title": "School Transport Tracking App",
      "client": "The Learning Hub School, Malindi",
      "period": "",
      "status": "ongoing",
      "statusNote": "In development",
      "category": "School systems",
      "featured": true,
      "summary": "An app for schools that links parents with the transport section and tracks learners' journeys.",
      "features": ["Links parents with the school's transport section", "Tracks learners' journeys"],
      "challenge": "",
      "approach": "",
      "outcome": "",
      "role": "Developer",
      "stack": [],
      "skills": ["Systems analysis & design"],
      "services": ["school-systems"],
      "links": [],
      "images": []
    },
    {
      "id": "frena-website",
      "cover": "FRENA",
      "title": "FRENA Website, SEO & Online Presence",
      "client": "FRENA (community organization)",
      "period": "",
      "status": "completed",
      "statusNote": "Maintained",
      "category": "Websites",
      "featured": true,
      "summary": "Built the website for FRENA, a community organization, and worked with them to improve their SEO and business profile. I also set up and registered their domain, transferred their website, set up professional email and maintain the site.",
      "features": [
        "Website design and build",
        "SEO improvements",
        "Business profile improvements",
        "Domain setup and registration",
        "Website transfer",
        "Professional email setup",
        "Ongoing maintenance"
      ],
      "challenge": "",
      "approach": "",
      "outcome": "",
      "role": "Web developer and IT support",
      "stack": [],
      "skills": [
        "Web development (responsive, mobile-first)",
        "SEO setup",
        "Business online profiles",
        "Domain registration & transfer",
        "DNS & hosting",
        "Business email setup",
        "Website maintenance"
      ],
      "services": ["websites", "business-online", "domains"],
      "links": [],
      "images": []
    },
    {
      "id": "learning-hub-website",
      "cover": "School website",
      "title": "The Learning Hub School Website",
      "client": "The Learning Hub School, Malindi",
      "period": "",
      "status": "completed",
      "statusNote": "I manage and maintain it",
      "category": "Websites",
      "featured": true,
      "summary": "Developed the school's website, which I manage and maintain, and worked with the school to improve its SEO and business profile.",
      "features": [
        "Website design and development",
        "SEO improvements",
        "Business profile improvements",
        "Ongoing management and maintenance"
      ],
      "challenge": "",
      "approach": "",
      "outcome": "",
      "role": "Web developer",
      "stack": [],
      "skills": [
        "Web development (responsive, mobile-first)",
        "SEO setup",
        "Business online profiles",
        "Website maintenance"
      ],
      "services": ["websites", "business-online"],
      "links": [],
      "images": []
    },
    {
      "id": "learning-hub-workspace",
      "cover": "Google Workspace",
      "title": "Google Workspace Setup & Staff Training",
      "client": "The Learning Hub School, Malindi",
      "period": "",
      "status": "completed",
      "statusNote": "",
      "category": "IT & cloud",
      "featured": true,
      "summary": "Set up Google Workspace for the school: created the staff email accounts, set up the working environment and trained staff to use it.",
      "features": ["Google Workspace setup", "Staff email accounts", "Working environment set up", "Staff training"],
      "challenge": "",
      "approach": "",
      "outcome": "",
      "role": "ICT Administrator",
      "stack": ["Google Workspace"],
      "skills": [
        "Google Workspace",
        "User accounts & access management",
        "Business email setup",
        "Staff training & digital literacy"
      ],
      "services": ["workspace"],
      "links": [],
      "images": []
    }
  ],
  "experience": [
    {
      "id": "learning-hub",
      "role": "ICT Administrator & IT Support",
      "org": "The Learning Hub School",
      "location": "Malindi, Kenya",
      "start": "2023-02",
      "end": "",
      "type": "Full-time",
      "points": [
        "Manage, maintain and troubleshoot the school's IT infrastructure, including networks, servers, software and devices, and provide responsive technical support that keeps systems reliable and secure.",
        "Administer user accounts, access permissions, backups and endpoint security, applying data-protection and confidentiality practices to sensitive records.",
        "Developed, tested and implemented two database-driven management information systems: one for learner results and staff records, and one for fee management and student records, using AI-assisted tools.",
        "Built centralised digital records and reporting, improving data quality, accuracy and accessibility while reducing manual, paper-based processes.",
        "Identify and implement practical digital solutions and automation that streamline workflows and improve efficiency.",
        "Train and support staff and learners in using digital tools; designed and deliver a digital-literacy course for users of varying ability.",
        "Developed, manage and maintain the school website, and worked with the school to improve its SEO and business profile.",
        "Set up Google Workspace for the school, created staff email accounts and the working environment, and trained staff to use it.",
        "Building a transport tracking app that links parents with the school's transport section and tracks learners' journeys."
      ],
      "skills": [
        "IT infrastructure management",
        "IT support & troubleshooting",
        "Networking (TCP/IP, LAN/WAN, Wi-Fi)",
        "Server & device maintenance",
        "User accounts & access management",
        "Backups & endpoint security",
        "Antivirus & endpoint protection",
        "Data protection & confidentiality (Kenya DPA)",
        "Database development & administration",
        "MIS development",
        "Systems analysis & design",
        "Systems integration",
        "AI-assisted development",
        "Reporting & records management",
        "Data quality assurance",
        "Workflow automation",
        "Staff training & digital literacy",
        "Microsoft 365",
        "Google Workspace",
        "Windows",
        "Linux/Unix",
        "Web development (responsive, mobile-first)",
        "SEO setup",
        "Business online profiles",
        "Website maintenance",
        "Business email setup"
      ]
    },
    {
      "id": "cloudfactory",
      "role": "Data Analyst, Data, Image & Video Analysis",
      "org": "CloudFactory",
      "location": "Remote",
      "start": "2020-01",
      "end": "",
      "type": "Remote",
      "points": [
        "Deliver accurate, high-quality output to defined guidelines and quality standards, building strong skills in data accuracy, consistency and interpretation.",
        "Perform data analysis and interpretation, plus image and video analysis, in a global remote workforce supporting AI/ML data operations.",
        "Collaborate reliably in a distributed, international team, adapting to evolving tools and workflows."
      ],
      "skills": ["Data analysis & interpretation", "Data quality assurance", "Image & video analysis"]
    },
    {
      "id": "global-forensics",
      "role": "ICT Intern, Cybersecurity & Digital Forensics",
      "org": "Global Forensics Services Limited",
      "location": "Nairobi, Kenya",
      "start": "2022-01",
      "end": "2022-08",
      "type": "Internship",
      "points": [
        "Supported data recovery, digital forensic analysis and incident reporting using 10+ security and forensic tools, applying secure data-handling procedures."
      ],
      "skills": [
        "Digital forensics & data recovery",
        "Data protection & confidentiality (Kenya DPA)",
        "ISO/IEC 27001 information security"
      ]
    },
    {
      "id": "moi-west",
      "role": "ICT Intern, Systems & Network Support",
      "org": "Moi University, West Campus",
      "location": "Eldoret, Kenya",
      "start": "2019-05",
      "end": "2019-08",
      "type": "Internship",
      "points": [
        "Installed and configured LAN/WAN networking and resolved Wi-Fi issues; installed hardware, software and drivers; maintained antivirus and endpoint security."
      ],
      "skills": [
        "Networking (TCP/IP, LAN/WAN, Wi-Fi)",
        "Hardware & software troubleshooting",
        "Server & device maintenance",
        "Antivirus & endpoint protection"
      ]
    },
    {
      "id": "moi-main",
      "role": "ICT Intern, Web & Applications",
      "org": "Moi University, Main Campus",
      "location": "Eldoret, Kenya",
      "start": "2018-04",
      "end": "2018-08",
      "type": "Internship",
      "points": [
        "Built websites, mobile applications and landing pages from concept to deployment, applying responsive, mobile-first design."
      ],
      "skills": ["Web development (responsive, mobile-first)", "Mobile app development (Android, iOS)"]
    }
  ],
  "education": [
    {
      "qualification": "BSc Computer Security and Forensics",
      "grade": "Second Class Honours (Lower Division)",
      "institution": "Jaramogi Oginga Odinga University of Science & Technology (JOOUST)",
      "location": "Bondo, Kenya",
      "period": "",
      "details": [
        "TCP/IP Network Administration",
        "Database Administration & Design",
        "Management Information Systems",
        "Information Systems Control & Audit",
        "Systems Analysis & Design",
        "Operating Systems",
        "Advanced Linux/Unix System Administration",
        "Cloud Computing"
      ]
    },
    {
      "qualification": "Kenya Certificate of Secondary Education (KCSE)",
      "grade": "Mean Grade B",
      "institution": "Chebuyusi Boys High School",
      "location": "Kakamega, Kenya",
      "period": "",
      "details": []
    }
  ],
  "certifications": [
    {
      "name": "ISO/IEC 27001 Information Security Associate",
      "issuer": "SkillFront",
      "year": "2022",
      "url": ""
    },
    {
      "name": "Foundations of Business and Entrepreneurship",
      "issuer": "SkillFront",
      "year": "2025",
      "url": ""
    },
    {
      "name": "Visible Thinking; Investigating the Forces that Shape Cultures of Thinking",
      "issuer": "Project Zero, Harvard Graduate School of Education",
      "year": "2024 & 2026",
      "url": ""
    }
  ],
  "rates": {
    "intro": "Starting prices for common jobs. Every project is different, so you get a fixed quote once I understand what you need. Items marked “on request” are priced per project.",
    "updated": "November 2026",
    "terms": [
      "Prices are in Kenyan shillings (KES) and are starting points. You get a fixed quote before any work begins.",
      "Third-party costs such as domains, hosting, licences and hardware are billed at cost unless stated.",
      "Projects start with a 50% deposit, with the balance due on delivery.",
      "Payment by M-Pesa or bank transfer.",
      "On-site work outside Malindi may include transport costs."
    ],
    "categories": [
      {
        "id": "web",
        "title": "Websites & web apps",
        "blurb": "Design, build and launch, with training so you can update it yourself.",
        "items": [
          {
            "id": "landing-page",
            "name": "Landing page / one-page website",
            "price": 12000,
            "unit": "one-off",
            "from": true,
            "popular": false,
            "addon": false,
            "turnaround": "3–5 days",
            "service": "websites",
            "includes": [
              "Single scrolling page, mobile-first",
              "Contact form and WhatsApp button",
              "Basic SEO and analytics",
              "One round of revisions"
            ]
          },
          {
            "id": "business-website",
            "name": "Business or school website (up to 6 pages)",
            "price": 30000,
            "unit": "one-off",
            "from": true,
            "popular": true,
            "addon": false,
            "turnaround": "1–2 weeks",
            "service": "websites",
            "includes": [
              "Custom design, up to 6 pages",
              "Contact forms, map and social links",
              "SEO setup (Search Console, sitemap)",
              "Speed and security basics",
              "Training on updating content"
            ]
          },
          {
            "id": "org-package",
            "name": "Organisation website package",
            "price": 40000,
            "unit": "one-off",
            "from": true,
            "popular": true,
            "addon": false,
            "turnaround": "2–3 weeks",
            "service": "websites",
            "includes": [
              "Website design and build",
              "Domain setup, registration or transfer",
              "Professional email setup",
              "SEO and business profile setup",
              "First month of maintenance"
            ]
          },
          {
            "id": "redesign",
            "name": "Website redesign or refresh",
            "price": 18000,
            "unit": "one-off",
            "from": true,
            "popular": false,
            "addon": false,
            "turnaround": "1–2 weeks",
            "service": "websites",
            "includes": ["Modern, mobile-first redesign", "Clearer page structure", "Speed and SEO improvements"]
          },
          {
            "id": "web-app",
            "name": "Custom web app or portal",
            "price": 80000,
            "unit": "per project",
            "from": true,
            "popular": false,
            "addon": false,
            "turnaround": "4+ weeks",
            "service": "web-apps",
            "includes": [
              "Requirements and workflow mapping",
              "Database design and role-based logins",
              "Testing, deployment and documentation"
            ]
          },
          {
            "id": "maintenance",
            "name": "Website maintenance plan",
            "price": 3500,
            "unit": "per month",
            "from": true,
            "popular": false,
            "addon": false,
            "turnaround": "Ongoing",
            "service": "business-online",
            "includes": [
              "Content updates (up to 2 hours a month)",
              "Backups and security updates",
              "Uptime monitoring",
              "Monthly check-up report"
            ]
          }
        ]
      },
      {
        "id": "school",
        "title": "School management systems",
        "blurb": "Built from real experience at The Learning Hub School.",
        "items": [
          {
            "id": "sms-full",
            "name": "School management system",
            "price": 80000,
            "unit": "one-off setup",
            "from": true,
            "popular": true,
            "addon": false,
            "turnaround": "4–8 weeks",
            "service": "school-systems",
            "includes": [
              "Results recording and analysis for teachers",
              "Parent access to view and track progress",
              "Student records",
              "User roles and access control",
              "Staff training"
            ]
          },
          {
            "id": "sms-module",
            "name": "Results & parent progress module",
            "price": 35000,
            "unit": "one-off",
            "from": true,
            "popular": false,
            "addon": false,
            "turnaround": "2–4 weeks",
            "service": "school-systems",
            "includes": ["Results recording and analysis", "Parent progress view", "Data import from Excel", "Staff training"]
          },
          {
            "id": "transport-app",
            "name": "School transport tracking app",
            "price": "",
            "unit": "in development",
            "from": false,
            "popular": false,
            "addon": false,
            "turnaround": "Ask to be notified",
            "service": "school-systems",
            "includes": [
              "Links parents with the school transport section",
              "Tracks learners' journeys",
              "In development: get in touch to register your interest"
            ]
          },
          {
            "id": "sms-migration",
            "name": "Data migration from Excel or paper",
            "price": 10000,
            "unit": "one-off",
            "from": true,
            "popular": false,
            "addon": true,
            "turnaround": "Depends on volume",
            "service": "school-systems",
            "includes": ["Cleaning and structuring records", "Import and verification"]
          },
          {
            "id": "sms-support",
            "name": "Hosting, support & updates",
            "price": 4000,
            "unit": "per month",
            "from": true,
            "popular": false,
            "addon": false,
            "turnaround": "Ongoing",
            "service": "school-systems",
            "includes": ["Secure hosting and backups", "Bug fixes and small updates", "Priority support"]
          }
        ]
      },
      {
        "id": "it",
        "title": "IT support & troubleshooting",
        "blurb": "On-site in Malindi and Kilifi County, or remote.",
        "items": [
          {
            "id": "callout",
            "name": "On-site call-out (Malindi)",
            "price": 2000,
            "unit": "first hour",
            "from": false,
            "popular": true,
            "addon": false,
            "turnaround": "Same or next day",
            "service": "ict-on-demand",
            "includes": ["Diagnosis and fix on site", "KES 1,000 per extra hour"]
          },
          {
            "id": "remote-session",
            "name": "Remote support session",
            "price": 1000,
            "unit": "per session (up to 1 hour)",
            "from": false,
            "popular": false,
            "addon": false,
            "turnaround": "Same day",
            "service": "ict-on-demand",
            "includes": ["Screen-sharing support", "Software, email and account problems"]
          },
          {
            "id": "device-repair",
            "name": "Computer troubleshooting & repair",
            "price": 1500,
            "unit": "per device",
            "from": true,
            "popular": false,
            "addon": false,
            "turnaround": "1–2 days",
            "service": "troubleshooting",
            "includes": ["Diagnosis", "Software fixes and tune-up", "Parts quoted separately"]
          },
          {
            "id": "os-install",
            "name": "Operating system install with drivers",
            "price": 2000,
            "unit": "per device",
            "from": false,
            "popular": false,
            "addon": false,
            "turnaround": "Same day",
            "service": "troubleshooting",
            "includes": ["Windows or Linux install", "Drivers and essential software", "Backup of your files first"]
          },
          {
            "id": "malware",
            "name": "Virus & malware removal",
            "price": 1500,
            "unit": "per device",
            "from": false,
            "popular": false,
            "addon": false,
            "turnaround": "Same day",
            "service": "troubleshooting",
            "includes": ["Scan and clean-up", "Endpoint protection setup"]
          },
          {
            "id": "data-recovery",
            "name": "Data recovery",
            "price": 3000,
            "unit": "per device",
            "from": true,
            "popular": false,
            "addon": false,
            "turnaround": "1–3 days",
            "service": "troubleshooting",
            "includes": ["Assessment of the drive", "Recovery from deleted, formatted or failing drives"]
          },
          {
            "id": "network-setup",
            "name": "Office network & Wi-Fi setup",
            "price": 8000,
            "unit": "labour",
            "from": true,
            "popular": false,
            "addon": false,
            "turnaround": "1–3 days",
            "service": "it-support",
            "includes": ["Router and access point setup", "Secure Wi-Fi and guest network", "Equipment billed at cost"]
          },
          {
            "id": "it-plan",
            "name": "Monthly IT support plan",
            "price": 12000,
            "unit": "per month",
            "from": true,
            "popular": true,
            "addon": false,
            "turnaround": "Ongoing",
            "service": "ict-on-demand",
            "includes": [
              "Up to 10 devices",
              "Monthly on-site check-up",
              "Priority remote and on-site support",
              "Backup and antivirus monitoring"
            ]
          },
          {
            "id": "workspace-setup",
            "name": "Google Workspace / Microsoft 365 setup",
            "price": 5000,
            "unit": "one-off",
            "from": true,
            "popular": false,
            "addon": false,
            "turnaround": "1–2 days",
            "service": "workspace",
            "includes": [
              "Organisation account setup",
              "Staff email accounts",
              "Shared drives, groups and permissions",
              "Licences billed at cost"
            ]
          },
          {
            "id": "workspace-training",
            "name": "Staff training: Google Workspace or Microsoft 365",
            "price": 5000,
            "unit": "per session (up to 15 people)",
            "from": false,
            "popular": false,
            "addon": false,
            "turnaround": "Book a date",
            "service": "workspace",
            "includes": [
              "Email, calendar, Drive and Docs",
              "Sharing and permissions",
              "Hands-on practice with your own accounts"
            ]
          }
        ]
      },
      {
        "id": "online",
        "title": "Business online setup & domains",
        "blurb": "Everything a business needs to be found and trusted online.",
        "items": [
          {
            "id": "starter-pack",
            "name": "Online presence starter pack",
            "price": 22000,
            "unit": "one-off",
            "from": true,
            "popular": false,
            "addon": false,
            "turnaround": "About 1 week",
            "service": "business-online",
            "includes": [
              "One-page website",
              "Domain and business email setup",
              "Google Business Profile",
              "Two social media pages",
              "Domain and hosting billed at cost"
            ]
          },
          {
            "id": "google-business",
            "name": "Google Business Profile setup",
            "price": 3000,
            "unit": "one-off",
            "from": false,
            "popular": false,
            "addon": false,
            "turnaround": "1–2 days",
            "service": "business-online",
            "includes": ["Profile creation and verification", "Photos, hours and services", "Map listing"]
          },
          {
            "id": "social-setup",
            "name": "Social media business pages",
            "price": 4000,
            "unit": "up to 3 platforms",
            "from": false,
            "popular": false,
            "addon": false,
            "turnaround": "1–2 days",
            "service": "business-online",
            "includes": ["Facebook, Instagram, LinkedIn or TikTok", "Profile images, bio and links"]
          },
          {
            "id": "business-email",
            "name": "Professional email on your domain",
            "price": 3500,
            "unit": "one-off",
            "from": true,
            "popular": false,
            "addon": false,
            "turnaround": "1 day",
            "service": "domains",
            "includes": ["Mailboxes and DNS records (MX, SPF, DKIM)", "Setup on phones and computers"]
          },
          {
            "id": "seo-setup",
            "name": "SEO setup",
            "price": 8000,
            "unit": "one-off",
            "from": true,
            "popular": false,
            "addon": false,
            "turnaround": "3–5 days",
            "service": "business-online",
            "includes": ["Search Console and analytics", "Sitemap and on-page fixes", "Google Business Profile link-up"]
          },
          {
            "id": "domain-coke",
            "name": "Domain registration (.co.ke)",
            "price": 1500,
            "unit": "per year",
            "from": true,
            "popular": false,
            "addon": false,
            "turnaround": "Same day",
            "service": "domains",
            "includes": ["Registration and DNS setup", "Pointed to your website and email"]
          },
          {
            "id": "domain-com",
            "name": "Domain registration (.com and others)",
            "price": 2500,
            "unit": "per year",
            "from": true,
            "popular": false,
            "addon": false,
            "turnaround": "Same day",
            "service": "domains",
            "includes": ["Registration and DNS setup", "Pointed to your website and email"]
          },
          {
            "id": "domain-transfer",
            "name": "Domain transfer",
            "price": 2000,
            "unit": "per domain",
            "from": true,
            "popular": false,
            "addon": false,
            "turnaround": "5–7 days",
            "service": "domains",
            "includes": ["Transfer to a new registrar", "Website and email kept working during the move"]
          },
          {
            "id": "hosting-setup",
            "name": "Website transfer or hosting setup",
            "price": 3000,
            "unit": "one-off",
            "from": true,
            "popular": false,
            "addon": false,
            "turnaround": "1–2 days",
            "service": "domains",
            "includes": ["Choosing a suitable host", "Website and email transfer", "SSL certificate setup"]
          }
        ]
      },
      {
        "id": "data-ai",
        "title": "Data, AI & training",
        "blurb": "Make sense of your data and get your team confident with AI.",
        "items": [
          {
            "id": "data-analysis",
            "name": "Data cleaning & analysis",
            "price": 5000,
            "unit": "per project",
            "from": true,
            "popular": false,
            "addon": false,
            "turnaround": "2–5 days",
            "service": "data-analysis",
            "includes": ["Cleaning and quality checks", "Analysis and a short report"]
          },
          {
            "id": "dashboard",
            "name": "Dashboard or automated report",
            "price": 10000,
            "unit": "one-off",
            "from": true,
            "popular": false,
            "addon": false,
            "turnaround": "3–7 days",
            "service": "data-analysis",
            "includes": ["Excel or Google Sheets dashboard", "Automated summaries"]
          },
          {
            "id": "analyst-hourly",
            "name": "Data analyst (hourly)",
            "price": 1500,
            "unit": "per hour",
            "from": false,
            "popular": false,
            "addon": false,
            "turnaround": "Flexible",
            "service": "data-analysis",
            "includes": ["Remote, flexible hours"]
          },
          {
            "id": "ai-setup",
            "name": "AI tools setup for your team",
            "price": 10000,
            "unit": "one-off",
            "from": true,
            "popular": true,
            "addon": false,
            "turnaround": "2–3 days",
            "service": "ai-training",
            "includes": [
              "Tool selection and accounts",
              "Usage guidelines and data-protection basics",
              "Starter prompt library"
            ]
          },
          {
            "id": "ai-workshop",
            "name": "AI training workshop",
            "price": 15000,
            "unit": "per half-day session (up to 20 people)",
            "from": false,
            "popular": false,
            "addon": false,
            "turnaround": "Book a date",
            "service": "ai-training",
            "includes": ["Hands-on, practical session", "Materials and follow-up Q&A"]
          },
          {
            "id": "ai-coaching",
            "name": "1-on-1 AI or digital skills coaching",
            "price": 2000,
            "unit": "per hour",
            "from": false,
            "popular": false,
            "addon": false,
            "turnaround": "Book a time",
            "service": "ai-training",
            "includes": ["In person or remote"]
          },
          {
            "id": "ai-prototype",
            "name": "AI-assisted prototype or internal tool",
            "price": 20000,
            "unit": "per project",
            "from": true,
            "popular": false,
            "addon": false,
            "turnaround": "1–2 weeks",
            "service": "ai-dev",
            "includes": ["Working prototype to test an idea", "Built with AI-assisted tools, reviewed and tested"]
          },
          {
            "id": "automation",
            "name": "Workflow automation",
            "price": 8000,
            "unit": "per workflow",
            "from": true,
            "popular": false,
            "addon": false,
            "turnaround": "2–5 days",
            "service": "ai-dev",
            "includes": ["Forms, spreadsheets and notifications", "Built with AI-assisted tools and tested"]
          }
        ]
      },
      {
        "id": "design-test",
        "title": "UI/UX design & testing",
        "blurb": "Clear designs, tested with real users and real devices.",
        "items": [
          {
            "id": "ux-prototype",
            "name": "UI/UX design & clickable prototype",
            "price": 15000,
            "unit": "up to 8 screens",
            "from": true,
            "popular": false,
            "addon": false,
            "turnaround": "1–2 weeks",
            "service": "ux-testing",
            "includes": ["User flows and wireframes", "High-fidelity screens", "Clickable prototype"]
          },
          {
            "id": "usability-test",
            "name": "Usability testing (5 users)",
            "price": 12000,
            "unit": "per round",
            "from": true,
            "popular": false,
            "addon": false,
            "turnaround": "1 week",
            "service": "ux-testing",
            "includes": ["Test plan and tasks", "Moderated sessions", "Findings and prioritised fixes"]
          },
          {
            "id": "qa-round",
            "name": "App or website QA testing",
            "price": 8000,
            "unit": "per test round",
            "from": true,
            "popular": false,
            "addon": false,
            "turnaround": "2–4 days",
            "service": "app-testing",
            "includes": ["Android, iOS and browser testing", "Bug reports with steps and screenshots", "Retest after fixes"]
          },
          {
            "id": "ux-review",
            "name": "UX review / audit",
            "price": 8000,
            "unit": "one-off",
            "from": true,
            "popular": false,
            "addon": false,
            "turnaround": "3–5 days",
            "service": "ux-testing",
            "includes": ["Expert review of key flows", "Prioritised recommendations"]
          }
        ]
      }
    ]
  },
  "testimonials": [],
  "share": {
    "profile": "I'm Roy Nyamiaka, an ICT administrator and web & systems developer in Malindi. I build websites and school management systems, and offer IT support, data analysis and AI setup & training. See my work here:",
    "cv": "My CV: ICT administration, web & systems development and data analysis, with {years}+ years of experience. Open to roles and contracts:",
    "rates": "My rate card for websites, school systems, IT support, domains, data and AI services, in KES. You can request a quote right from the page:",
    "quote": "Need a website, IT support or a school system? Send me your request here and I'll come back to you with a quote:",
    "projects": "Projects I've delivered and am working on: a school management system, a school transport tracking app, organisation websites with SEO, domains and email, and Google Workspace setup:"
  }
};
