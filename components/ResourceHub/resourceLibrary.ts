export type ResourceItem = {
  id: string;
  title: string;
  type: string;
  difficulty: string;
  description: string;
  category: string;
  studios: string[];
  tags: string[];
  url: string;
  learningUse: string;
};

export const resourceLibrary: ResourceItem[] = [
  {
    "id": "policy-analysis-problem-solving",
    "title": "Policy Analysis as Problem Solving",
    "type": "Book Chapter / Textbook",
    "difficulty": "Core",
    "description": "A practical resource for defining policy problems, structuring analysis, and moving from problem framing to feasible policy options.",
    "category": "Problem definition / policy analysis",
    "studios": [
      "Problem Studio",
      "Solution Studio"
    ],
    "tags": [
      "problem definition",
      "policy analysis",
      "problem solving",
      "options"
    ],
    "url": "/resources/books/policy-analysis-problem-solving.pdf",
    "learningUse": "Supports problem framing, structured analysis, and development of feasible policy options."
  },
  {
    "id": "policy-analysis-concepts-practice",
    "title": "Policy Analysis: Concepts and Practice",
    "type": "Textbook",
    "difficulty": "Core",
    "description": "A foundational policy analysis text covering problem diagnosis, criteria, alternatives, and recommendation logic.",
    "category": "Policy analysis / options appraisal",
    "studios": [
      "Problem Studio",
      "Solution Studio"
    ],
    "tags": [
      "criteria",
      "alternatives",
      "evaluation",
      "recommendations"
    ],
    "url": "/resources/books/policy-analysis-concepts-practice.pdf",
    "learningUse": "Helps students compare options systematically and strengthen evidence-based recommendations."
  },
  {
    "id": "art-craft-policy-analysis",
    "title": "The Art and Craft of Policy Analysis",
    "type": "Book",
    "difficulty": "Supplementary",
    "description": "A classic policy analysis resource emphasizing judgment, framing, argumentation, and practical reasoning.",
    "category": "Policy thinking",
    "studios": [
      "Problem Studio",
      "Solution Studio"
    ],
    "tags": [
      "policy reasoning",
      "judgment",
      "argumentation",
      "analysis"
    ],
    "url": "/resources/books/art-and-craft-of-policy-analysis.pdf",
    "learningUse": "Provides deeper conceptual grounding in policy reasoning and decision-making under uncertainty."
  },
  {
    "id": "designing-public-policies",
    "title": "Designing Public Policies",
    "type": "Textbook",
    "difficulty": "Core",
    "description": "A key policy design text focused on policy instruments, design principles, and matching tools to policy problems.",
    "category": "Policy instruments / design",
    "studios": [
      "Solution Studio",
      "Implementation Studio"
    ],
    "tags": [
      "policy design",
      "policy instruments",
      "solution design",
      "implementation"
    ],
    "url": "/resources/books/designing-public-policies.pdf",
    "learningUse": "Supports selection and justification of policy instruments and implementation choices."
  },
  {
    "id": "getting-health-reform-right",
    "title": "Getting Health Reform Right",
    "type": "Textbook",
    "difficulty": "Core",
    "description": "A health reform guide linking performance goals, equity, feasibility, implementation, and system reform choices.",
    "category": "Health reform / policy design",
    "studios": [
      "Solution Studio",
      "Implementation Studio"
    ],
    "tags": [
      "health reform",
      "equity",
      "health systems",
      "implementation"
    ],
    "url": "/resources/books/getting-health-reform-right.pdf",
    "learningUse": "Helps health policy students connect reform options with system performance and implementation realities."
  },
  {
    "id": "health-policy-analysis",
    "title": "Health Policy Analysis",
    "type": "Textbook",
    "difficulty": "Core",
    "description": "A health policy analysis text covering policy development, stakeholders, institutions, implementation, and evaluation.",
    "category": "Health policy analysis",
    "studios": [
      "Problem Studio",
      "Process Studio",
      "Solution Studio",
      "Implementation Studio"
    ],
    "tags": [
      "health policy",
      "stakeholders",
      "institutions",
      "evaluation"
    ],
    "url": "/resources/books/health-policy-analysis.pdf",
    "learningUse": "Provides a health-specific foundation across the full policy analysis and implementation pathway."
  },
  {
    "id": "systems-thinking-health",
    "title": "Systems Thinking for Health",
    "type": "Guide / Report",
    "difficulty": "Core",
    "description": "A systems-thinking resource for understanding complex health system problems, feedback loops, actors, and unintended consequences.",
    "category": "Systems thinking",
    "studios": [
      "Problem Studio",
      "Process Studio",
      "Implementation Studio"
    ],
    "tags": [
      "systems thinking",
      "health systems",
      "complexity",
      "feedback loops"
    ],
    "url": "/resources/systems/systems-thinking-for-health.pdf",
    "learningUse": "Supports system diagnosis, stakeholder mapping, and consideration of unintended effects."
  },
  {
    "id": "policy-design-method-cards",
    "title": "Policy Design Methods in Action Cards",
    "type": "Toolkit / Cards",
    "difficulty": "Core",
    "description": "A practical set of participatory design method cards for engagement and co-design activities.",
    "category": "Co-design methods",
    "studios": [
      "Process Studio",
      "Solution Studio"
    ],
    "tags": [
      "co-design",
      "participatory design",
      "methods",
      "engagement"
    ],
    "url": "/resources/methods/policy-design-method-cards.pdf",
    "learningUse": "Helps students select and structure stakeholder engagement and participatory activities."
  },
  {
    "id": "state-guided-innovation",
    "title": "Analyzing the Effectiveness of State-Guided Innovation",
    "type": "Journal Article",
    "difficulty": "Supplementary",
    "description": "An academic article examining how public institutions guide innovation and the conditions influencing effectiveness.",
    "category": "Innovation governance",
    "studios": [
      "Solution Studio",
      "Implementation Studio"
    ],
    "tags": [
      "innovation governance",
      "public sector",
      "institutions",
      "effectiveness"
    ],
    "url": "/resources/methods/state-guided-innovation-effectiveness.pdf",
    "learningUse": "Supports analysis of institutional roles, governance arrangements, and implementation conditions."
  },
  {
    "id": "innovation-labs-public-services",
    "title": "Innovating Public Services: Drivers and Challenges of Innovation Labs",
    "type": "Journal Article",
    "difficulty": "Supplementary",
    "description": "A study of innovation labs in the co-production of public and e-government services.",
    "category": "Innovation labs / co-production",
    "studios": [
      "Process Studio",
      "Implementation Studio"
    ],
    "tags": [
      "innovation labs",
      "co-production",
      "public services",
      "e-government"
    ],
    "url": "/resources/policy-labs/innovation-labs-public-services.pdf",
    "learningUse": "Shows how innovation labs support co-production and the practical challenges they face."
  },
  {
    "id": "rise-of-policy-labs",
    "title": "Rise of Policy Labs",
    "type": "Article / Report",
    "difficulty": "Supplementary",
    "description": "Background reading on the growth of policy labs and their role in experimentation and public problem-solving.",
    "category": "Policy labs background",
    "studios": [
      "Process Studio",
      "Solution Studio"
    ],
    "tags": [
      "policy labs",
      "innovation",
      "experimentation",
      "public sector"
    ],
    "url": "/resources/policy-labs/rise-of-policy-labs.pdf",
    "learningUse": "Provides context for understanding the emergence and purpose of policy labs."
  },
  {
    "id": "limits-policy-labs",
    "title": "Limits of Policy Labs",
    "type": "Article / Report",
    "difficulty": "Supplementary",
    "description": "A critical resource on the limitations, risks, and practical constraints of policy lab approaches.",
    "category": "Critical reflection",
    "studios": [
      "Process Studio",
      "Solution Studio",
      "Implementation Studio"
    ],
    "tags": [
      "policy labs",
      "limitations",
      "feasibility",
      "critical reflection"
    ],
    "url": "/resources/policy-labs/limits-of-policy-labs.pdf",
    "learningUse": "Encourages realistic assessment of policy lab methods, limitations, and feasibility."
  },
  {
    "id": "typology-innovation-labs",
    "title": "Typology of Public Sector Innovation Labs",
    "type": "Article / Framework",
    "difficulty": "Supplementary",
    "description": "A framework for understanding different forms of public sector innovation labs and their roles.",
    "category": "Innovation lab types",
    "studios": [
      "Process Studio",
      "Solution Studio"
    ],
    "tags": [
      "public sector innovation",
      "typology",
      "policy labs",
      "institutional design"
    ],
    "url": "/resources/policy-labs/typology-public-sector-innovation-labs.pdf",
    "learningUse": "Helps students distinguish innovation lab models and connect institutional form with purpose."
  },
  {
    "id": "case-study-uk",
    "title": "UK Case Study",
    "type": "Case Study",
    "difficulty": "Case",
    "description": "A case study showing how policy lab or design approaches have been applied in the UK context.",
    "category": "Policy lab case study",
    "studios": [
      "Process Studio",
      "Implementation Studio"
    ],
    "tags": [
      "UK",
      "policy lab",
      "case study",
      "process"
    ],
    "url": "/resources/case-studies/case-study-uk.pdf",
    "learningUse": "Provides a practical example for comparing process design and implementation choices."
  },
  {
    "id": "case-study-finland",
    "title": "Finland Case Study",
    "type": "Case Study",
    "difficulty": "Case",
    "description": "A case study on public sector design and innovation practices in Finland.",
    "category": "Design in public sector",
    "studios": [
      "Process Studio",
      "Implementation Studio"
    ],
    "tags": [
      "Finland",
      "public sector",
      "design",
      "innovation"
    ],
    "url": "/resources/case-studies/case-study-finland.pdf",
    "learningUse": "Supports comparative analysis of design-led public sector innovation."
  },
  {
    "id": "case-study-sweden",
    "title": "Sweden Case Study",
    "type": "Case Study",
    "difficulty": "Case",
    "description": "A case study useful for understanding systemic design and public sector innovation in Sweden.",
    "category": "Systemic design",
    "studios": [
      "Process Studio",
      "Implementation Studio"
    ],
    "tags": [
      "Sweden",
      "systemic design",
      "innovation",
      "case study"
    ],
    "url": "/resources/case-studies/case-study-sweden.pdf",
    "learningUse": "Demonstrates systemic design and governance considerations in practice."
  },
  {
    "id": "case-study-brazil",
    "title": "Brazil Case Study",
    "type": "Case Study",
    "difficulty": "Case",
    "description": "A case study of policy innovation and design practice in the Brazilian context.",
    "category": "Policy innovation case study",
    "studios": [
      "Process Studio",
      "Implementation Studio"
    ],
    "tags": [
      "Brazil",
      "policy innovation",
      "case study",
      "public sector"
    ],
    "url": "/resources/case-studies/case-study-brazil.pdf",
    "learningUse": "Offers comparative lessons on policy innovation, context, and implementation."
  },
  {
    "id": "public-policy-schools-future",
    "title": "Public Policy Schools of the Future",
    "type": "Book / Report",
    "difficulty": "Instructor",
    "description": "A forward-looking resource on the future role, curriculum, and development of public policy education.",
    "category": "Public policy education",
    "studios": [
      "Templates / Tools"
    ],
    "tags": [
      "policy education",
      "curriculum",
      "public policy schools",
      "future"
    ],
    "url": "/resources/teaching/public-policy-schools-future.pdf",
    "learningUse": "Useful as background for instructors and for understanding the educational purpose of policy labs."
  },
  {
    "id": "handbook-teaching-public-policy",
    "title": "Handbook of Teaching Public Policy",
    "type": "Handbook",
    "difficulty": "Instructor",
    "description": "A comprehensive handbook on approaches, methods, and practices for teaching public policy.",
    "category": "Teaching and pedagogy",
    "studios": [
      "Templates / Tools"
    ],
    "tags": [
      "teaching",
      "pedagogy",
      "public policy",
      "methods"
    ],
    "url": "/resources/teaching/handbook-teaching-public-policy.pdf",
    "learningUse": "Supports instructors in selecting teaching methods and structuring policy learning activities."
  }
];
