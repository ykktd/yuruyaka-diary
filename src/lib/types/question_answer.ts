export interface QuestionAnswer {
  id: string;             // UUID
  entry_id: string;       // Entry.id
  question_id: string;    // Question.id
  answer_text: string;    // 回答内容
  created_at?: string;
  updated_at?: string;
}