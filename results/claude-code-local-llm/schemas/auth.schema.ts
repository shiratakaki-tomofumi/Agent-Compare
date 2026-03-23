import { z } from "zod";

export const signInSchema = z.object({
  email: z.string().email("有効なメールアドレスを入力してください"),
  password: z.string().min(8, "パスワードは最低 8 文字必要です"),
});

export type SignInInput = z.infer<typeof signInSchema>;
