# CLAUDE.md — Yuruyaka Diary 実装指示書

> Claude Code がこのリポジトリで作業する際の**唯一の拠り所**となるドキュメントです。  
> コードを書く前に必ずここを読み、思想・規則・構造をすべて頭に入れてください。

---

## 0. このアプリの絶対的な設計思想

**「0文字でもOK / 雑でもOK / 1分で終わってOK」**

この一文がすべての判断軸です。コードを書くとき、UIを組むとき、文言を決めるとき、常にこの思想に照らしてください。

- ユーザーの行為を評価・ランク付けしない
- 書けなかった日を「失敗」として確定させない
- 入口だけを静かに用意し、強制しない
- **余計な機能・UI要素を追加しない**（シンプルさ自体がUX）

---

## 1. 技術スタック

| レイヤー     | 技術                   | 備考                             |
| ------------ | ---------------------- | -------------------------------- |
| Frontend     | SvelteKit + TypeScript | `.svelte` + `.ts` ファイルで構成 |
| スタイル     | Tailwind CSS v3        | カスタムカラーあり（後述）       |
| Backend / DB | Supabase (PostgreSQL)  | MVP では RLS を有効化しない      |
| Hosting      | Cloudflare Pages       |                                  |
| アイコン     | lucide-svelte          |                                  |

> **注意**: 企画書内のモックアップコードは React/TSX で書かれていますが、実装は **Svelte/SvelteKit + TypeScript** です。React のコードは UI・ロジックの参考にとどめ、そのままコピーしないでください。

---

## 2. プロジェクト構成

```
src/
├── lib/
│   ├── components/        # 再利用可能なUIコンポーネント
│   │   ├── ui/            # 汎用部品（Button, Card, CheckboxChip, MoodSlider）
│   │   └── dashboard/     # ダッシュボード専用コンポーネント
│   ├── stores/            # Svelte stores（状態管理）
│   ├── services/          # Supabase クライアント・API呼び出し
│   │   ├── supabase.ts    # クライアント初期化
│   │   ├── entries.ts     # entries テーブル操作
│   │   ├── prompts.ts     # prompts テーブル操作
│   │   └── responses.ts   # responses テーブル操作
│   ├── types/             # 共通 TypeScript 型定義
│   │   └── index.ts
│   └── constants/         # 定数（WEEK_DAYS など）
│       └── index.ts
├── routes/
│   ├── +layout.svelte     # 共通レイアウト
│   ├── +page.svelte       # ダッシュボード（/）
│   └── record/
│       └── [date]/
│           └── +page.svelte  # 記録画面（/record/YYYY-MM-DD）
└── app.html
```

---

## 3. データベース設計

### 3.1 テーブル定義

#### `entries`（1日1レコード）

```sql
CREATE TABLE entries (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- user_id は MVP では持たない。認証導入時に ALTER TABLE で追加する。
  date        DATE NOT NULL UNIQUE,
  mood        INTEGER CHECK (mood BETWEEN 0 AND 100),
  slept_well  BOOLEAN DEFAULT FALSE,
  busy        BOOLEAN DEFAULT FALSE,
  went_out    BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);
```

#### `prompts`（質問マスター）

```sql
CREATE TABLE prompts (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type       TEXT NOT NULL CHECK (type IN ('daily_question', 'free_note')),
  text       TEXT NOT NULL,
  is_active  BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `responses`（ユーザーの記述）

```sql
CREATE TABLE responses (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id   UUID REFERENCES entries(id) ON DELETE CASCADE,
  prompt_id  UUID REFERENCES prompts(id),
  content    TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  -- 同じ entry + prompt の組み合わせは1レコードのみ許容する（upsert の前提）
  CONSTRAINT unique_entry_prompt UNIQUE (entry_id, prompt_id)
);
```

### 3.2 重要な設計意図

- `entries` は「日」の属性のみ保持し、文章は持たない
- 自由記述も質問回答もすべて `responses` に統一（`prompt_id` で区別）
- エントリーは**ユーザーが明示的に記録ボタンを押したときのみ生成**する。ページを開いただけでは生成しない

---

## 4. TypeScript 型定義

`src/lib/types/index.ts` に以下を定義してください：

> **型生成ポリシー**: `supabase gen types typescript` による自動生成は**使用しない**。自動生成型はスネークケースになるため、Svelte コンポーネントのキャメルケースと二重管理になる。このファイルの手動定義を唯一の型の情報源とする。

```typescript
export interface Entry {
	id: string;
	// user_id は MVP では存在しない
	date: string; // ISO 8601: "YYYY-MM-DD"
	mood: number; // 0-100
	sleptWell: boolean;
	busy: boolean;
	wentOut: boolean;
	createdAt: string;
	updatedAt: string;
}

export interface Prompt {
	id: string;
	type: 'daily_question' | 'free_note';
	text: string;
	isActive: boolean;
	createdAt: string;
}

export interface DiaryResponse {
	id: string;
	entryId: string;
	promptId: string;
	content: string;
	createdAt: string;
}

// 記録画面で扱う集約型
export interface EntryWithResponses {
	entry: Entry;
	responses: DiaryResponse[];
}
```

> **注意**: `Response` は TypeScript / Web API のビルトイン型名と衝突するため `DiaryResponse` を使用する。

---

## 5. デザインシステム

### 5.1 Tailwind カスタム設定（`tailwind.config.ts`）

```typescript
import type { Config } from 'tailwindcss';

export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			fontFamily: {
				sans: ['"Zen Maru Gothic"', 'sans-serif']
			},
			colors: {
				brand: {
					50: '#f0f9ff',
					100: '#e0f2fe',
					200: '#bae6fd',
					300: '#7dd3fc',
					400: '#38bdf8',
					500: '#0ea5e9', // メインアクション・アクセント
					600: '#0284c7', // ホバー
					700: '#0369a1',
					800: '#075985',
					900: '#0c4a6e'
				}
			}
		}
	}
} satisfies Config;
```

### 5.2 カラー使用ルール

| 用途                       | クラス                            |
| -------------------------- | --------------------------------- |
| アプリ背景                 | `bg-slate-50`                     |
| カード背景                 | `bg-white`                        |
| メインテキスト（日付など） | `text-slate-800`                  |
| 本文・入力テキスト         | `text-slate-600`                  |
| 補足・ラベル               | `text-slate-400`                  |
| プレースホルダー           | `text-slate-300`                  |
| メインボタン               | `bg-brand-500 hover:bg-brand-600` |
| ボタンの影                 | `shadow-lg shadow-brand-200/50`   |

### 5.3 形状ルール

| 要素             | クラス                              |
| ---------------- | ----------------------------------- |
| カード・コンテナ | `rounded-2xl`                       |
| ボタン           | `rounded-xl`                        |
| 入力フォーム     | `rounded-lg`                        |
| カードの影       | `shadow-sm border border-slate-100` |

### 5.4 余白ルール

- カード内余白: `p-6`〜`p-10`
- セクション間: `space-y-6`〜`space-y-8`
- ページ全体の横幅上限: `max-w-md mx-auto`（モバイルファースト）

### 5.5 フォント

Google Fonts の `Zen Maru Gothic` を `app.html` の `<head>` で読み込む：

```html
<link
	href="https://fonts.googleapis.com/css2?family=Zen+Maru+Gothic:wght@400;500;700&display=swap"
	rel="stylesheet"
/>
```

### 5.6 `app.css` の初期設定

`src/app.css` に以下を記述し、`src/routes/+layout.svelte` でインポートする：

```css
/* src/app.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
	background-color: #f8fafc; /* slate-50 */
}
```

```svelte
<!-- src/routes/+layout.svelte -->
<script>
	import '../app.css';
</script>

<slot />
```

---

## 6. 画面仕様

### 6.1 ダッシュボード（`/`）

**表示要素：**

1. 今日の日付（例：2026年3月27日 木曜日）
2. メインCTAボタン
   - 今日のエントリー未作成 → `「今日を記録する」`（brand-500）
   - 作成済み → `「今日の記録を見る・編集する」`（secondary スタイル）
3. サブ導線（**昨日のエントリーが存在しない場合のみ**表示）
   - `「昨日の記録を書く」`
   - ボタン押下時は `/record/YYYY-MM-DD` へ遷移するだけ。DB操作は行わない

**禁止事項：**

- 連続記録日数などの数値表示
- 「未記録」「空白」などの否定的表現
- 記録がない日をグレーアウトして強調するような演出

**グラフ（過去7日分の記録有無）：**

- 記録あり: `bg-brand-400`
- 記録なし: `bg-slate-200`
- 数値・グリッド線は表示しない

### 6.2 記録画面（`/record/[date]`）

**今日・過去日で共通の構造：**

1. **ヘッダー**
   - 戻るボタン（ダッシュボードへ）
   - 対象日付
   - 過去日の場合のみ: `「過去の記録を作成中」`を brand-500 で小さく表示

2. **質問エリア（Question of the day）**
   - その日の `daily_question` を1問表示
   - 回答テキストエリア（プレースホルダー: `「回答は必須ではありません...」`）

3. **自由記述エリア（Free Note）**
   - プレースホルダー: `「ここは自由に書いていい場所です」` または `「一言だけでもOK」`

4. **気分スライダー（Mood）**
   - 0〜100, Bad / Neutral / Good
   - デフォルト: 50

5. **チェックボックスチップ（Activities）**
   - よく寝た / 忙しかった / 外出した

6. **固定フッター（保存ボタン）**
   - `「保存する」` ボタン（floating, `shadow-xl shadow-brand-500/20`）
   - 保存後は必ずダッシュボード（`/`）に戻る

**過去日のアクセス範囲：**

- URL を直打ちすれば任意の過去日にアクセスできる。これは**意図的な仕様**であり、制限しない
- 未来日（今日より後の日付）へのアクセスは `/` にリダイレクトする

**質問の選択ロジック：**

```typescript
// 日付から決定論的に質問を選ぶ（日が変わるまで同じ質問が出る）
const dayIndex = new Date(dateStr).getDate() % prompts.length;
const todayPrompt = prompts[dayIndex];
```

---

## 7. Svelte コンポーネント設計

### 7.1 汎用 UI コンポーネント（`src/lib/components/ui/`）

以下を独立したコンポーネントとして実装してください：

**`Button.svelte`**

```svelte
<script lang="ts">
	export let variant: 'primary' | 'secondary' | 'ghost' = 'primary';
	export let fullWidth = false;
	export let disabled = false;
</script>
```

**`Card.svelte`**

```svelte
<script lang="ts">
	export let clickable = false;
</script>
```

**`CheckboxChip.svelte`**

```svelte
<script lang="ts">
	import type { ComponentType } from 'svelte';
	export let label: string;
	export let checked = false;
	// lucide-svelte のコンポーネントを直接渡す。文字列は不可。
	// 呼び出し側: <CheckboxChip icon={Moon} ... />
	// テンプレート内: <svelte:component this={icon} size={18} />
	export let icon: ComponentType | undefined = undefined;
</script>
```

**`MoodSlider.svelte`**

```svelte
<script lang="ts">
	export let value = 50;
</script>
```

### 7.2 Store 設計（`src/lib/stores/diary.ts`）

`load` 関数から `+page.svelte` に渡せないページ横断的な状態のみ store に置く：

```typescript
import { writable } from 'svelte/store';
import type { Entry, Prompt } from '$lib/types';

export const currentEntry = writable<Entry | null>(null);
export const todayPrompt = writable<Prompt | null>(null);
```

---

## 8. Supabase サービス層

`src/lib/services/entries.ts` の責務：

```typescript
// エントリーを日付で取得（なければ null を返す）
export async function getEntryByDate(date: string): Promise<Entry | null>;

// エントリーを新規作成または更新（upsert）
// date カラムに UNIQUE 制約があるため ON CONFLICT で更新する
export async function upsertEntry(
	entry: Omit<Entry, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Entry>;

// 過去N日分の記録済み日付一覧を取得（ダッシュボードのグラフ用）
export async function getRecentEntryDates(days: number): Promise<string[]>;
```

`src/lib/services/responses.ts` の責務：

```typescript
// entry_id に紐づく全 response を取得
export async function getResponsesByEntryId(entryId: string): Promise<DiaryResponse[]>;

// response を新規作成または内容を更新（upsert）
// responses テーブルの UNIQUE (entry_id, prompt_id) 制約を前提とする
// content が空文字のときも保存する（0文字OK の設計思想）
export async function upsertResponse(
	entryId: string,
	promptId: string,
	content: string
): Promise<DiaryResponse>;
```

> **Supabase の upsert 構文メモ**: `supabase.from('responses').upsert({ entry_id, prompt_id, content }, { onConflict: 'entry_id,prompt_id' })`

---

## 9. Git 規則

### 9.1 ブランチ戦略

```
main           ← 本番相当。直接コミット禁止
  └── develop  ← 統合ブランチ。各機能の合流先
        ├── feature/xxx
        ├── fix/xxx
        └── chore/xxx
```

### 9.2 ブランチ命名規則

| プレフィックス | 用途                   | 例                     |
| -------------- | ---------------------- | ---------------------- |
| `feature/`     | 新機能                 | `feature/dashboard-ui` |
| `fix/`         | バグ修正               | `fix/entry-not-saved`  |
| `chore/`       | 環境・設定・リファクタ | `chore/setup-supabase` |
| `docs/`        | ドキュメント変更のみ   | `docs/update-readme`   |

- **ケバブケース** で書く（スペース・アンダースコア禁止）
- 日本語禁止
- 長くても **3〜4単語** 以内

### 9.3 コミットメッセージ規則（Conventional Commits）

```
<type>(<scope>): <subject>
```

| type       | 用途                   |
| ---------- | ---------------------- |
| `feat`     | 新機能                 |
| `fix`      | バグ修正               |
| `style`    | UIスタイルのみの変更   |
| `refactor` | リファクタリング       |
| `chore`    | ビルド・設定・依存関係 |
| `docs`     | ドキュメントのみ       |

**scope 例（省略可）：** `dashboard`, `record`, `ui`, `db`, `store`, `types`

subject は英語・動詞の原形で始め、50文字以内、末尾ピリオドなし。

```
feat(dashboard): add yesterday entry shortcut link
fix(record): prevent entry creation on page load
chore: add supabase environment variables
```

### 9.4 コミットの粒度

- **1コミット = 1つの論理的な変更**（`feat` と `fix` を混ぜない）
- UI コンポーネントはコンポーネント単位でコミットする
- WIP 状態ではコミットしない（`--amend` や `stash` を使う）

### 9.5 プルリクエスト（PR）規則

タイトルはコミットメッセージと同じフォーマット。本文テンプレート（`.github/pull_request_template.md`）：

```markdown
## 概要

<!-- この PR で何をしたか、1〜3行で -->

## 動作確認

- [ ] ダッシュボードが正常に表示される
- [ ] 記録画面への遷移が正常
- [ ] 保存後にダッシュボードへ戻る
- [ ] 過去日でも記録できる
- [ ] 0文字でも保存できる
- [ ] 昨日のエントリーがない場合のみサブ導線が表示される
```

マージ先は `develop`。`main` への直接 PR 禁止。`develop → main` のみ Squash merge。

### 9.6 チェック方法

**コミット前（毎回）：**

```bash
pnpm format   # Prettier で自動整形。必ず lint より先に実行する
pnpm lint     # Prettier チェック + ESLint
pnpm check    # svelte-check + TypeScript 型検査
```

**PR 作成前（追加で）：**

```bash
pnpm build    # 本番ビルドが通ることを確認
pnpm dev      # ローカルで実際の動作を目視確認
```

---

## 10. 実装の優先順位（MVP）

以下の順序で実装してください。各ステップで動作確認を行ってからコミットすること。

### Step 0: Git ブランチの初期化（最初に必ず実行）

```bash
# SvelteKit プロジェクト作成後、最初のコミットを main に積んだら即座に実行する
git checkout -b develop
git push -u origin develop
# GitHub の Settings > Branches で Default Branch を develop に変更する
# main への Branch Protection Rule を設定する（直接 push を禁止）
```

### Step 1〜9: 機能実装

1. `chore`: プロジェクトセットアップ（SvelteKit + TypeScript + Tailwind + Supabase）
2. `chore`: Tailwind カスタムカラー・フォント設定 / `app.css` 初期設定 / `.github/pull_request_template.md` 作成
3. `feat(types)`: TypeScript 型定義（`src/lib/types/index.ts`）
4. `feat(db)`: Supabase テーブル作成・サービス層実装（`entries.ts`, `prompts.ts`, `responses.ts`）
5. `feat(ui)`: 汎用 UI コンポーネント実装（Button, Card, CheckboxChip, MoodSlider）
6. `feat(dashboard)`: ダッシュボード画面実装
7. `feat(record)`: 記録画面実装（今日）
8. `feat(record)`: 過去日対応（URL パラメータ処理）
9. `fix` / `style`: 全体調整・バグ修正

### SvelteKit データ取得パターン（全画面共通）

データ取得は**必ず `+page.ts` の `load` 関数で行う**。`+page.svelte` 内の `onMount` で Supabase を直接呼ぶことは禁止。

```typescript
// src/routes/record/[date]/+page.ts
import type { PageLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { getEntryByDate } from '$lib/services/entries';
import { getResponsesByEntryId } from '$lib/services/responses';
import { getActivePrompts } from '$lib/services/prompts';

export const load: PageLoad = async ({ params }) => {
	const { date } = params;

	// 未来日はダッシュボードへリダイレクト
	if (date > new Date().toISOString().split('T')[0]) {
		throw redirect(302, '/');
	}

	const [entry, prompts] = await Promise.all([
		getEntryByDate(date),
		getActivePrompts('daily_question')
	]);

	// 既存エントリーがある場合のみ responses を取得
	const responses = entry ? await getResponsesByEntryId(entry.id) : [];

	return { date, entry, prompts, responses };
};
```

ダッシュボード（`/`）も同様に `src/routes/+page.ts` を作成し、`load` 関数で今日・昨日のエントリー有無と過去7日分のデータを取得する。`+page.svelte` では `export let data: PageData` で受け取る。

---

## 11. コーディング規約

- ファイル名: コンポーネントは PascalCase（`MoodSlider.svelte`）、それ以外は camelCase（`entries.ts`）
- 型定義: `interface` を優先。`any` 禁止、型不明なら `unknown` を使う
- Svelte: `bind:value` を積極的に使用してよい。`$:` は派生値の計算に使い、API 呼び出し等の副作用は `onMount` で行う
- エラーハンドリング: Supabase 呼び出しは `try/catch` でラップし、失敗をユーザーに伝える（過剰なエラー画面は不要）
- 環境変数: `.env` に `PUBLIC_SUPABASE_URL`, `PUBLIC_SUPABASE_ANON_KEY` を定義し `$env/static/public` からインポート

---

## 12. MVP で実装しないこと（触れない）

以下は将来拡張として**今は実装しない**。コードに混入させないこと：

- 認証（ユーザーログイン・サインアップ）
- RLS（Row Level Security）の有効化
- 感情ヒートマップ（月次）
- 「過去の今日」機能
- 詳細な統計・数値化表示
- 通知機能
- 複数ユーザー対応

---

## 13. 禁止事項まとめ

| 禁止                                     | 理由                 |
| ---------------------------------------- | -------------------- |
| 連続記録日数の表示                       | 評価・競争につながる |
| 「未記録」「空白」「サボった」などの文言 | 設計思想に反する     |
| ページ表示でのエントリー自動生成         | 行為ベース設計の原則 |
| React / JSX の混入                       | 技術スタックが異なる |
| `main` への直接コミット                  | ブランチ戦略違反     |
| `any` 型の使用                           | 型安全性の確保       |

---

_最終更新: 2026-03-27 (v4 — pnpm化・個人開発向けにスリム化)_
