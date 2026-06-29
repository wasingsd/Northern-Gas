"use client";

import { User2, Lock } from "lucide-react";
import { useActionState } from "react";
import { loginAction } from "./actions";

export default function LoginPage() {
  const [state, action, isPending] = useActionState(loginAction, undefined);

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm border border-border">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-foreground">Gas Store System</h1>
          <p className="text-gray-500 mt-2 text-sm">ลงชื่อเข้าใช้เพื่อจัดการระบบ</p>
        </div>

        <form action={action} className="space-y-6">
          {state?.error && (
            <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm text-center">
              {state.error}
            </div>
          )}
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">อีเมล</label>
            <div className="relative">
              <User2 className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="email"
                name="email"
                placeholder="you@example.com"
                className="w-full rounded-lg border border-border pl-10 pr-4 py-2.5 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">รหัสผ่าน</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="password"
                name="password"
                placeholder="••••••••"
                className="w-full rounded-lg border border-border pl-10 pr-4 py-2.5 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-lg bg-primary py-2.5 text-white font-medium hover:bg-primary-hover transition-colors disabled:opacity-50"
          >
            {isPending ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
          </button>
        </form>
      </div>
    </div>
  );
}
