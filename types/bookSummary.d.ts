export interface BookSummary {
  id: string;
  status: 'draft' | 'in_review' | 'review' | 'published' | 'archived' | 'final';
  book: any;
  metadata: any;
  summary_glance?: {
    overview?: string;
    who_should_read?: string;
    time_to_read?: string;
    key_takeaways?: string[];
  };
  core?: any;
  core_concepts?: any[];
  chapters?: any[];
  insights?: any[];
  recommendations?: any[];
  recommendation_rules?: any[];
  adler_reading_answers?: any;
  usage_scenarios?: any;
  tags?: string[];
}
