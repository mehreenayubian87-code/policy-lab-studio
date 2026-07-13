export type PortfolioCohort = {
  id: string;
  label: string;
  program: string;
  year: string;
  count: number;
};

export type PortfolioPoster = {
  id: string;
  title: string;
  group: string;
  program: string;
  cohortId: string;
  cohortLabel: string;
  year: string;
  pdfUrl: string;
};

export const portfolioCohorts: PortfolioCohort[] = [
  {
    "id": "mghp-first-cohort",
    "label": "MGHP \u2013 First Cohort",
    "program": "MGHP",
    "year": "First Cohort",
    "count": 5
  },
  {
    "id": "mpp-fall-2023",
    "label": "MPP \u2013 Fall 2023",
    "program": "MPP",
    "year": "2023",
    "count": 9
  },
  {
    "id": "mpp-fall-2024",
    "label": "MPP \u2013 Fall 2024",
    "program": "MPP",
    "year": "2024",
    "count": 10
  },
  {
    "id": "mpp-fall-2025",
    "label": "MPP \u2013 Fall 2025",
    "program": "MPP",
    "year": "2025",
    "count": 10
  }
];

export const portfolioPosters: PortfolioPoster[] = [
  {
    "id": "mghp-first-cohort-group-1",
    "title": "Group 1",
    "group": "Group 1",
    "program": "MGHP",
    "cohortId": "mghp-first-cohort",
    "cohortLabel": "MGHP \u2013 First Cohort",
    "year": "First Cohort",
    "pdfUrl": "/posters/mghp-first-cohort/group-1.pdf"
  },
  {
    "id": "mghp-first-cohort-group-2",
    "title": "Group 2",
    "group": "Group 2",
    "program": "MGHP",
    "cohortId": "mghp-first-cohort",
    "cohortLabel": "MGHP \u2013 First Cohort",
    "year": "First Cohort",
    "pdfUrl": "/posters/mghp-first-cohort/group-2.pdf"
  },
  {
    "id": "mghp-first-cohort-group-3",
    "title": "Group 3",
    "group": "Group 3",
    "program": "MGHP",
    "cohortId": "mghp-first-cohort",
    "cohortLabel": "MGHP \u2013 First Cohort",
    "year": "First Cohort",
    "pdfUrl": "/posters/mghp-first-cohort/group-3.pdf"
  },
  {
    "id": "mghp-first-cohort-group-4",
    "title": "Group 4",
    "group": "Group 4",
    "program": "MGHP",
    "cohortId": "mghp-first-cohort",
    "cohortLabel": "MGHP \u2013 First Cohort",
    "year": "First Cohort",
    "pdfUrl": "/posters/mghp-first-cohort/group-4.pdf"
  },
  {
    "id": "mghp-first-cohort-group-5",
    "title": "Group 5",
    "group": "Group 5",
    "program": "MGHP",
    "cohortId": "mghp-first-cohort",
    "cohortLabel": "MGHP \u2013 First Cohort",
    "year": "First Cohort",
    "pdfUrl": "/posters/mghp-first-cohort/group-5.pdf"
  },
  {
    "id": "mpp-fall-2023-group-1",
    "title": "Group 1",
    "group": "Group 1",
    "program": "MPP",
    "cohortId": "mpp-fall-2023",
    "cohortLabel": "MPP \u2013 Fall 2023",
    "year": "2023",
    "pdfUrl": "/posters/mpp-fall-2023/group-1.pdf"
  },
  {
    "id": "mpp-fall-2023-group-2",
    "title": "Group 2",
    "group": "Group 2",
    "program": "MPP",
    "cohortId": "mpp-fall-2023",
    "cohortLabel": "MPP \u2013 Fall 2023",
    "year": "2023",
    "pdfUrl": "/posters/mpp-fall-2023/group-2.pdf"
  },
  {
    "id": "mpp-fall-2023-group-3",
    "title": "Group 3",
    "group": "Group 3",
    "program": "MPP",
    "cohortId": "mpp-fall-2023",
    "cohortLabel": "MPP \u2013 Fall 2023",
    "year": "2023",
    "pdfUrl": "/posters/mpp-fall-2023/group-3.pdf"
  },
  {
    "id": "mpp-fall-2023-group-4",
    "title": "Group 4",
    "group": "Group 4",
    "program": "MPP",
    "cohortId": "mpp-fall-2023",
    "cohortLabel": "MPP \u2013 Fall 2023",
    "year": "2023",
    "pdfUrl": "/posters/mpp-fall-2023/group-4.pdf"
  },
  {
    "id": "mpp-fall-2023-group-5",
    "title": "Group 5",
    "group": "Group 5",
    "program": "MPP",
    "cohortId": "mpp-fall-2023",
    "cohortLabel": "MPP \u2013 Fall 2023",
    "year": "2023",
    "pdfUrl": "/posters/mpp-fall-2023/group-5.pdf"
  },
  {
    "id": "mpp-fall-2023-group-6",
    "title": "Group 6",
    "group": "Group 6",
    "program": "MPP",
    "cohortId": "mpp-fall-2023",
    "cohortLabel": "MPP \u2013 Fall 2023",
    "year": "2023",
    "pdfUrl": "/posters/mpp-fall-2023/group-6.pdf"
  },
  {
    "id": "mpp-fall-2023-group-7",
    "title": "Group 7",
    "group": "Group 7",
    "program": "MPP",
    "cohortId": "mpp-fall-2023",
    "cohortLabel": "MPP \u2013 Fall 2023",
    "year": "2023",
    "pdfUrl": "/posters/mpp-fall-2023/group-7.pdf"
  },
  {
    "id": "mpp-fall-2023-group-8",
    "title": "Group 8",
    "group": "Group 8",
    "program": "MPP",
    "cohortId": "mpp-fall-2023",
    "cohortLabel": "MPP \u2013 Fall 2023",
    "year": "2023",
    "pdfUrl": "/posters/mpp-fall-2023/group-8.pdf"
  },
  {
    "id": "mpp-fall-2023-group-9",
    "title": "Group 9",
    "group": "Group 9",
    "program": "MPP",
    "cohortId": "mpp-fall-2023",
    "cohortLabel": "MPP \u2013 Fall 2023",
    "year": "2023",
    "pdfUrl": "/posters/mpp-fall-2023/group-9.pdf"
  },
  {
    "id": "mpp-fall-2024-group-1",
    "title": "Group 1",
    "group": "Group 1",
    "program": "MPP",
    "cohortId": "mpp-fall-2024",
    "cohortLabel": "MPP \u2013 Fall 2024",
    "year": "2024",
    "pdfUrl": "/posters/mpp-fall-2024/group-1.pdf"
  },
  {
    "id": "mpp-fall-2024-group-2",
    "title": "Group 2",
    "group": "Group 2",
    "program": "MPP",
    "cohortId": "mpp-fall-2024",
    "cohortLabel": "MPP \u2013 Fall 2024",
    "year": "2024",
    "pdfUrl": "/posters/mpp-fall-2024/group-2.pdf"
  },
  {
    "id": "mpp-fall-2024-group-3",
    "title": "Group 3",
    "group": "Group 3",
    "program": "MPP",
    "cohortId": "mpp-fall-2024",
    "cohortLabel": "MPP \u2013 Fall 2024",
    "year": "2024",
    "pdfUrl": "/posters/mpp-fall-2024/group-3.pdf"
  },
  {
    "id": "mpp-fall-2024-group-4",
    "title": "Group 4",
    "group": "Group 4",
    "program": "MPP",
    "cohortId": "mpp-fall-2024",
    "cohortLabel": "MPP \u2013 Fall 2024",
    "year": "2024",
    "pdfUrl": "/posters/mpp-fall-2024/group-4.pdf"
  },
  {
    "id": "mpp-fall-2024-group-5",
    "title": "Group 5",
    "group": "Group 5",
    "program": "MPP",
    "cohortId": "mpp-fall-2024",
    "cohortLabel": "MPP \u2013 Fall 2024",
    "year": "2024",
    "pdfUrl": "/posters/mpp-fall-2024/group-5.pdf"
  },
  {
    "id": "mpp-fall-2024-group-6",
    "title": "Group 6",
    "group": "Group 6",
    "program": "MPP",
    "cohortId": "mpp-fall-2024",
    "cohortLabel": "MPP \u2013 Fall 2024",
    "year": "2024",
    "pdfUrl": "/posters/mpp-fall-2024/group-6.pdf"
  },
  {
    "id": "mpp-fall-2024-group-7",
    "title": "Group 7",
    "group": "Group 7",
    "program": "MPP",
    "cohortId": "mpp-fall-2024",
    "cohortLabel": "MPP \u2013 Fall 2024",
    "year": "2024",
    "pdfUrl": "/posters/mpp-fall-2024/group-7.pdf"
  },
  {
    "id": "mpp-fall-2024-group-8",
    "title": "Group 8",
    "group": "Group 8",
    "program": "MPP",
    "cohortId": "mpp-fall-2024",
    "cohortLabel": "MPP \u2013 Fall 2024",
    "year": "2024",
    "pdfUrl": "/posters/mpp-fall-2024/group-8.pdf"
  },
  {
    "id": "mpp-fall-2024-group-9",
    "title": "Group 9",
    "group": "Group 9",
    "program": "MPP",
    "cohortId": "mpp-fall-2024",
    "cohortLabel": "MPP \u2013 Fall 2024",
    "year": "2024",
    "pdfUrl": "/posters/mpp-fall-2024/group-9.pdf"
  },
  {
    "id": "mpp-fall-2024-group-10",
    "title": "Group 10",
    "group": "Group 10",
    "program": "MPP",
    "cohortId": "mpp-fall-2024",
    "cohortLabel": "MPP \u2013 Fall 2024",
    "year": "2024",
    "pdfUrl": "/posters/mpp-fall-2024/group-10.pdf"
  },
  {
    "id": "mpp-fall-2025-group-1",
    "title": "Group 1",
    "group": "Group 1",
    "program": "MPP",
    "cohortId": "mpp-fall-2025",
    "cohortLabel": "MPP \u2013 Fall 2025",
    "year": "2025",
    "pdfUrl": "/posters/mpp-fall-2025/group-1.pdf"
  },
  {
    "id": "mpp-fall-2025-group-2",
    "title": "Group 2",
    "group": "Group 2",
    "program": "MPP",
    "cohortId": "mpp-fall-2025",
    "cohortLabel": "MPP \u2013 Fall 2025",
    "year": "2025",
    "pdfUrl": "/posters/mpp-fall-2025/group-2.pdf"
  },
  {
    "id": "mpp-fall-2025-group-3",
    "title": "Group 3",
    "group": "Group 3",
    "program": "MPP",
    "cohortId": "mpp-fall-2025",
    "cohortLabel": "MPP \u2013 Fall 2025",
    "year": "2025",
    "pdfUrl": "/posters/mpp-fall-2025/group-3.pdf"
  },
  {
    "id": "mpp-fall-2025-group-4",
    "title": "Group 4",
    "group": "Group 4",
    "program": "MPP",
    "cohortId": "mpp-fall-2025",
    "cohortLabel": "MPP \u2013 Fall 2025",
    "year": "2025",
    "pdfUrl": "/posters/mpp-fall-2025/group-4.pdf"
  },
  {
    "id": "mpp-fall-2025-group-5",
    "title": "Group 5",
    "group": "Group 5",
    "program": "MPP",
    "cohortId": "mpp-fall-2025",
    "cohortLabel": "MPP \u2013 Fall 2025",
    "year": "2025",
    "pdfUrl": "/posters/mpp-fall-2025/group-5.pdf"
  },
  {
    "id": "mpp-fall-2025-group-6",
    "title": "Group 6",
    "group": "Group 6",
    "program": "MPP",
    "cohortId": "mpp-fall-2025",
    "cohortLabel": "MPP \u2013 Fall 2025",
    "year": "2025",
    "pdfUrl": "/posters/mpp-fall-2025/group-6.pdf"
  },
  {
    "id": "mpp-fall-2025-group-7",
    "title": "Group 7",
    "group": "Group 7",
    "program": "MPP",
    "cohortId": "mpp-fall-2025",
    "cohortLabel": "MPP \u2013 Fall 2025",
    "year": "2025",
    "pdfUrl": "/posters/mpp-fall-2025/group-7.pdf"
  },
  {
    "id": "mpp-fall-2025-group-8",
    "title": "Group 8",
    "group": "Group 8",
    "program": "MPP",
    "cohortId": "mpp-fall-2025",
    "cohortLabel": "MPP \u2013 Fall 2025",
    "year": "2025",
    "pdfUrl": "/posters/mpp-fall-2025/group-8.pdf"
  },
  {
    "id": "mpp-fall-2025-group-9",
    "title": "Group 9",
    "group": "Group 9",
    "program": "MPP",
    "cohortId": "mpp-fall-2025",
    "cohortLabel": "MPP \u2013 Fall 2025",
    "year": "2025",
    "pdfUrl": "/posters/mpp-fall-2025/group-9.pdf"
  },
  {
    "id": "mpp-fall-2025-group-10",
    "title": "Group 10",
    "group": "Group 10",
    "program": "MPP",
    "cohortId": "mpp-fall-2025",
    "cohortLabel": "MPP \u2013 Fall 2025",
    "year": "2025",
    "pdfUrl": "/posters/mpp-fall-2025/group-10.pdf"
  }
];
