export type PromptType = 'daily_question' | 'free_note';

export interface Question {
  id: string;             // UUID
  text: string;           // 質問本文
  type: PromptType;       // daily_question / free_note
  is_active: boolean;     // 現在使用中かどうか
  created_at?: string;
  updated_at?: string;
}