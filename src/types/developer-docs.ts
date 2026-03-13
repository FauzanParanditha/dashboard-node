export type DocsTone = "info" | "warning" | "success";

export type CodeExample = {
  label: string;
  language: string;
  code: string;
  description?: string;
};

export type DocsCallout = {
  title: string;
  tone: DocsTone;
  content: string[];
};

export type DocsTable = {
  columns: string[];
  rows: string[][];
};

export type EndpointSummary = {
  method: string;
  path: string;
  purpose: string;
  audience: string;
};

export type DeveloperGuideSection = {
  id: string;
  title: string;
  summary?: string;
  paragraphs?: string[];
  bullets?: string[];
  callouts?: DocsCallout[];
  codeExamples?: CodeExample[];
  table?: DocsTable;
};

export type DeveloperGuide = {
  slug: string;
  title: string;
  subtitle: string;
  updatedAt: string;
  audience: string;
  summary: string;
  badges: string[];
  baseUrlDev: string;
  sections: DeveloperGuideSection[];
  endpointSummaries: EndpointSummary[];
  testerDefaults: {
    endpointUrl: string;
    phoneNumber: string;
    paymentMethod: string;
    itemId: string;
    itemName: string;
    itemType: string;
    itemPrice: string;
    quantity: string;
    totalAmount: string;
  };
};
