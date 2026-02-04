export type ViewPeriod = "weekly" | "biweekly" | "monthly" | "yearly";

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

export type Profile = {
  id: string;
  name: string;
  views: View[];
  activeViewId: string;
};

export type AppState = {
  schemaVersion: number; // 1
  profiles: Profile[];
  activeProfileId: string;
};
