"use client";

import { createClient } from "@/lib/supabase/client";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { LogOut } from "lucide-react";
import { useEffect, useState } from "react";

function getInitial(email: string | undefined): string {
  if (!email) return "?";
  const part = email.split("@")[0];
  return part?.charAt(0)?.toUpperCase() ?? "?";
}

export function UserMenu() {
  const [email, setEmail] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const load = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setEmail(session?.user?.email ?? null);
    };
    load();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user?.email ?? null);
    });
    return () => subscription.unsubscribe();
  }, [supabase]);

  async function handleSignOut() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal-600 text-white text-sm font-medium border border-teal-500/50 hover:bg-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:ring-offset-background"
          aria-label="Open user menu"
        >
          {getInitial(email ?? undefined)}
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="z-50 min-w-[200px] rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-md"
          sideOffset={6}
          align="end"
        >
          {email && (
            <div className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground border-b border-border">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-500/20 text-teal-400 text-xs font-medium">
                {getInitial(email)}
              </span>
              <span className="truncate">{email}</span>
            </div>
          )}
          <DropdownMenu.Item
            onSelect={handleSignOut}
            className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm text-red-500 outline-none hover:bg-red-500/10 focus:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/10 dark:focus:bg-red-500/10"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            Sign Out
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
