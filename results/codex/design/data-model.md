# BizBoard — データモデル定義

## リレーション

```
Department 1──N User 1──N Deal N──1 Customer
                   1──N Task N──1 Project N──1 Department
                   1──N Expense (applicant/approver)
                   1──N Attendance
Department 1──N Budget
```

---

## テーブル定義

### User（ユーザー）

| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| id | String (UUID) | PK | ユーザーID |
| email | String | UNIQUE, NOT NULL | メールアドレス |
| password | String | NOT NULL | ハッシュ化パスワード |
| name | String | NOT NULL | 氏名 |
| role | Enum (ADMIN, MANAGER, MEMBER) | NOT NULL, DEFAULT MEMBER | ロール |
| departmentId | String (UUID) | FK → Department.id, NULL | 所属部署 |
| position | String | NULL | 役職 |
| hireDate | DateTime | NULL | 入社日 |
| isActive | Boolean | NOT NULL, DEFAULT true | 有効フラグ |
| createdAt | DateTime | NOT NULL, DEFAULT now | 作成日時 |
| updatedAt | DateTime | NOT NULL, auto-update | 更新日時 |

---

### Department（部署）

| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| id | String (UUID) | PK | 部署ID |
| name | String | UNIQUE, NOT NULL | 部署名 |
| description | String | NULL | 説明 |
| createdAt | DateTime | NOT NULL, DEFAULT now | 作成日時 |
| updatedAt | DateTime | NOT NULL, auto-update | 更新日時 |

---

### Customer（顧客）

| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| id | String (UUID) | PK | 顧客ID |
| companyName | String | NOT NULL | 会社名 |
| contactName | String | NOT NULL | 担当者名 |
| email | String | NOT NULL | メールアドレス |
| phone | String | NULL | 電話番号 |
| status | Enum (ACTIVE, DORMANT) | NOT NULL, DEFAULT ACTIVE | ステータス |
| isDeleted | Boolean | NOT NULL, DEFAULT false | 論理削除フラグ |
| createdAt | DateTime | NOT NULL, DEFAULT now | 作成日時 |
| updatedAt | DateTime | NOT NULL, auto-update | 更新日時 |

---

### Deal（商談）

| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| id | String (UUID) | PK | 商談ID |
| title | String | NOT NULL | 商談名 |
| customerId | String (UUID) | FK → Customer.id, NOT NULL | 顧客 |
| assigneeId | String (UUID) | FK → User.id, NOT NULL | 担当者 |
| amount | Int | NOT NULL | 金額（円） |
| probability | Int | NOT NULL, DEFAULT 0 | 確度（0-100%） |
| status | Enum (LEAD, PROPOSAL, NEGOTIATION, WON, LOST) | NOT NULL, DEFAULT LEAD | ステータス |
| note | String | NULL | メモ |
| closedAt | DateTime | NULL | クローズ日 |
| createdAt | DateTime | NOT NULL, DEFAULT now | 作成日時 |
| updatedAt | DateTime | NOT NULL, auto-update | 更新日時 |

---

### Project（案件）

| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| id | String (UUID) | PK | 案件ID |
| name | String | NOT NULL | 案件名 |
| description | String | NULL | 説明 |
| departmentId | String (UUID) | FK → Department.id, NOT NULL | 担当部署 |
| status | Enum (PLANNING, IN_PROGRESS, COMPLETED, ON_HOLD) | NOT NULL, DEFAULT PLANNING | ステータス |
| startDate | DateTime | NOT NULL | 開始日 |
| endDate | DateTime | NOT NULL | 終了予定日 |
| isDeleted | Boolean | NOT NULL, DEFAULT false | 論理削除フラグ |
| createdAt | DateTime | NOT NULL, DEFAULT now | 作成日時 |
| updatedAt | DateTime | NOT NULL, auto-update | 更新日時 |

---

### Task（タスク）

| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| id | String (UUID) | PK | タスクID |
| title | String | NOT NULL | タスク名 |
| description | String | NULL | 説明 |
| projectId | String (UUID) | FK → Project.id, NOT NULL | 所属案件 |
| assigneeId | String (UUID) | FK → User.id, NULL | 担当者 |
| priority | Enum (LOW, MEDIUM, HIGH) | NOT NULL, DEFAULT MEDIUM | 優先度 |
| status | Enum (TODO, IN_PROGRESS, REVIEW, DONE) | NOT NULL, DEFAULT TODO | ステータス |
| dueDate | DateTime | NULL | 期限 |
| createdAt | DateTime | NOT NULL, DEFAULT now | 作成日時 |
| updatedAt | DateTime | NOT NULL, auto-update | 更新日時 |

---

### Expense（経費）

| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| id | String (UUID) | PK | 経費ID |
| applicantId | String (UUID) | FK → User.id, NOT NULL | 申請者 |
| amount | Int | NOT NULL | 金額（円） |
| category | Enum (TRAVEL, ENTERTAINMENT, SUPPLIES, OTHER) | NOT NULL | カテゴリ |
| description | String | NOT NULL | 説明 |
| expenseDate | DateTime | NOT NULL | 経費発生日 |
| status | Enum (PENDING, APPROVED, REJECTED) | NOT NULL, DEFAULT PENDING | 承認ステータス |
| approverId | String (UUID) | FK → User.id, NULL | 承認者 |
| approverComment | String | NULL | 承認者コメント |
| approvedAt | DateTime | NULL | 承認日時 |
| createdAt | DateTime | NOT NULL, DEFAULT now | 作成日時 |
| updatedAt | DateTime | NOT NULL, auto-update | 更新日時 |

---

### Budget（予算）

| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| id | String (UUID) | PK | 予算ID |
| departmentId | String (UUID) | FK → Department.id, NOT NULL | 部署 |
| year | Int | NOT NULL | 年度 |
| month | Int | NOT NULL | 月（1-12） |
| amount | Int | NOT NULL | 予算額（円） |
| createdAt | DateTime | NOT NULL, DEFAULT now | 作成日時 |
| updatedAt | DateTime | NOT NULL, auto-update | 更新日時 |

**ユニーク制約**: (departmentId, year, month)

---

### Attendance（勤怠）

| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| id | String (UUID) | PK | 勤怠ID |
| userId | String (UUID) | FK → User.id, NOT NULL | 従業員 |
| date | DateTime | NOT NULL | 日付 |
| checkIn | DateTime | NULL | 出勤時刻 |
| checkOut | DateTime | NULL | 退勤時刻 |
| overtimeHours | Float | NOT NULL, DEFAULT 0 | 残業時間 |
| createdAt | DateTime | NOT NULL, DEFAULT now | 作成日時 |
| updatedAt | DateTime | NOT NULL, auto-update | 更新日時 |

**ユニーク制約**: (userId, date)

---

### Revenue（売上）

| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| id | String (UUID) | PK | 売上ID |
| year | Int | NOT NULL | 年度 |
| month | Int | NOT NULL | 月（1-12） |
| amount | Int | NOT NULL | 売上額（円） |
| target | Int | NOT NULL | 目標額（円） |
| createdAt | DateTime | NOT NULL, DEFAULT now | 作成日時 |
| updatedAt | DateTime | NOT NULL, auto-update | 更新日時 |

**ユニーク制約**: (year, month)

---

## インデックス推奨

| テーブル | カラム | 理由 |
|---------|--------|------|
| User | email | ログイン時の検索 |
| User | departmentId | 部署別一覧 |
| Deal | customerId | 顧客別商談一覧 |
| Deal | assigneeId | 担当者別商談一覧 |
| Deal | status | ステータス別フィルタ |
| Task | projectId | 案件別タスク一覧 |
| Task | assigneeId | 担当者別タスク一覧 |
| Expense | applicantId | 申請者別一覧 |
| Expense | status | 承認待ちフィルタ |
| Attendance | userId, date | 従業員別月次集計 |
