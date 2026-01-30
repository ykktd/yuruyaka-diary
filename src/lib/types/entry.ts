export interface Entry {
  id: string;             // Supabase で自動生成される UUID
  user_id: string;        // Supabase Auth の uid
  date: string;           // ISO 形式 (例: "2026-01-29")
  mood: number;           // 0 ~ 100
  sleptWell: boolean;     // よく寝た
  busy: boolean;          // 忙しかった
  wentOut: boolean;       // 外出した
  created_at?: string;    // Supabase 自動生成
  updated_at?: string;    // Supabase 自動生成
}