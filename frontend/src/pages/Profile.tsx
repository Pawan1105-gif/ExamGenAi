import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

export function Profile() {
  const { user, token, refreshUser } = useAuth();
  const [name, setName] = useState(user?.name ?? "");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user?.name) setName(user.name);
  }, [user?.name]);

  async function saveName(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    setBusy(true);
    try {
      await apiFetch("/api/users/me", {
        method: "PATCH",
        token,
        body: JSON.stringify({ name }),
      });
      await refreshUser();
      toast.success("Profile updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Update failed");
    } finally {
      setBusy(false);
    }
  }

  async function onAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !token) return;
    const fd = new FormData();
    fd.append("avatar", file);
    try {
      const res = await fetch("/api/users/me/avatar", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Upload failed");
      }
      await refreshUser();
      toast.success("Avatar updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      e.target.value = "";
    }
  }

  const avatarSrc = user?.avatarUrl
    ? `${import.meta.env.VITE_API_URL || ""}${user.avatarUrl}`
    : null;

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Profile</h1>
        <p className="text-sm text-[var(--color-muted)]">
          Manage your identity and avatar.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>{user?.email}</CardDescription>
        </CardHeader>
        <div className="flex items-center gap-4">
          <motion.div
            className="neo-surface flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl text-2xl font-semibold"
            whileHover={{ scale: 1.03 }}
          >
            {avatarSrc ? (
              <img src={avatarSrc} alt="" className="h-full w-full object-cover" />
            ) : (
              user?.name?.slice(0, 1).toUpperCase()
            )}
          </motion.div>
          <div>
            <Label htmlFor="avatar">Avatar</Label>
            <Input
              id="avatar"
              type="file"
              accept="image/*"
              className="mt-1 cursor-pointer text-xs"
              onChange={onAvatar}
            />
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2">
          <span className="text-xs text-[var(--color-muted)]">Role</span>
          <Badge>{user?.role}</Badge>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Display name</CardTitle>
        </CardHeader>
        <form onSubmit={saveName} className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <Button type="submit" disabled={busy}>
            {busy ? "Saving…" : "Save name"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
