export type Preferences = {
  tags?: string[];
  tech_level?: string;
  emotional_state?: string[];
  children?: string[];
};

export type Recipe = {
  title: string;
  prep_time_minutes?: number;
  dietary_tags?: string[];
  ingredients?: string[];
  steps?: string[];
  metadata?: {
    cost?: string;
    comfort_food?: boolean;
    split_portion?: boolean;
    [key: string]: unknown;
  };
  [key: string]: unknown;
};

export function startOfWeek(date = new Date()): string {
  const d = new Date(date);
  const day = d.getUTCDay();
  const diff = d.getUTCDate() - day + (day === 0 ? -6 : 1);
  d.setUTCDate(diff);
  d.setUTCHours(0, 0, 0, 0);
  return d.toISOString().split("T")[0];
}

export function personalize(recipes: Recipe[], prefs: Preferences = {}) {
  return recipes.filter((r) => {
    if (prefs.tags?.includes("burned out") && r.prep_time_minutes && r.prep_time_minutes > 30) return false;
    if (prefs.tags?.includes("low income") && r.metadata?.cost !== "budget") return false;
    if (prefs.tech_level === "low" && r.steps && r.steps.length > 10) return false;
    if (prefs.emotional_state?.includes("grieving") && !r.metadata?.comfort_food) return false;
    if (prefs.children?.includes("toddler") && prefs.children?.includes("teen") && !r.metadata?.split_portion) return false;
    return true;
  });
}
