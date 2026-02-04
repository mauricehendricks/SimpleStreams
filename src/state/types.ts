export type ViewPeriod = "weekly" | "semimonthly" | "monthly" | "yearly";

export type Stream = {
  id: string;
  name: string;
  amount: number;
  viewPeriod: ViewPeriod;
  color: string;
};

export type View = {
  id: string;
  name: string;
  income: Stream[];
  expenses: Stream[];
  taxAllocationRate: number; // 0–100, default 30
};

export type AppState = {
  schemaVersion: number; // 3
  views: View[];
  activeViewId: string;
};
