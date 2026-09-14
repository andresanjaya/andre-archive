export type ArchiveType = 'case-file' | 'field-note' | 'experiment' | 'photography' | 'culture' | 'timeline';

export type ArchiveRecord = {
  id: string;
  type: ArchiveType;
  label: string;
  title: string;
  summary: string;
  year?: string;
  themes: string[];
  relatedCollection?: string;
  featured?: boolean;
  placeholder: boolean;
  sections?: { heading: string; copy: string }[];
};

export const archiveRecords: ArchiveRecord[] = [
  {
    id: 'badung-sehat',
    type: 'case-file',
    label: 'Case File 01',
    title: 'Badung Sehat',
    summary:
      'A connected public-health service experience covering ambulance response, telemedicine, home care, emergency services, and health monitoring.',
    themes: ['Healthcare'],
    featured: true,
    placeholder: true,
    sections: [
      { heading: 'Overview', copy: 'Placeholder overview. Approved project evidence and case-study material are still required.' },
      { heading: 'Context', copy: 'Public-safe context has not yet been supplied for publication.' },
      { heading: 'Problem', copy: 'A verified problem statement is still required.' },
      { heading: 'Role and Team', copy: 'Andre’s role, collaborators, and duration have not yet been confirmed.' },
      { heading: 'Constraints', copy: 'Verified project constraints are still required.' },
      { heading: 'Process', copy: 'Approved process evidence is still required.' },
      { heading: 'Key Decisions', copy: 'Approved decisions and supporting rationale are still required.' },
      { heading: 'Final Design', copy: 'Approved, public-safe interface imagery has not yet been supplied.' },
      { heading: 'Outcome', copy: 'No outcome or metric is claimed until verified evidence is supplied.' },
      { heading: 'Reflection', copy: 'An approved reflection is still required.' },
    ],
  },
  {
    id: 'simrs-emr-giri-asih',
    type: 'case-file',
    label: 'Case File 02',
    title: 'SIMRS EMR Giri Asih',
    summary:
      'An EMR experience for clinical workflows, patient registration, CPPT history, and readable medical documentation.',
    themes: ['Healthcare'],
    placeholder: true,
    sections: [
      { heading: 'Overview', copy: 'Placeholder case-file record. Approved evidence and images are still required.' },
      { heading: 'Case study status', copy: 'Role, date, process, decisions, and outcomes remain unconfirmed and are intentionally omitted.' },
    ],
  },
  {
    id: 'table-action-placement',
    type: 'field-note',
    label: 'Field Note 01',
    title: 'Table action placement',
    summary: 'A placeholder for a future note on making table actions easier to find and use.',
    themes: ['Interface clarity', 'Tables'],
    placeholder: true,
    sections: [
      { heading: 'Question', copy: 'What makes actions in dense data tables easier to find without creating visual noise?' },
      { heading: 'Status', copy: 'This is a placeholder. A real observation, supported evidence, Andre’s inference, and recommendation are still required.' },
    ],
  },
];

export const boardLayout = [
  { id: 'badung-sehat', x: 315, y: 230, width: 425, height: 330, rotation: -2 },
  { id: 'simrs-emr-giri-asih', x: 855, y: 325, width: 340, height: 275, rotation: 2 },
  { id: 'table-action-placement', x: 720, y: 680, width: 295, height: 215, rotation: -1 },
] as const;
