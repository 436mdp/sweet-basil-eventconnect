import { redirect } from "next/navigation";
import { format } from "date-fns";
import { getAuthContext } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { AdminNav } from "@/components/admin/admin-nav";
import { UserRoleToggle } from "@/components/admin/user-role-toggle";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Profile } from "@/types/database.types";

export default async function AdminUsersPage() {
  const ctx = await getAuthContext();
  if (!ctx.isAdmin) redirect("/login");

  const supabase = await createClient();
  const { data: users } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  const userList = (users ?? []) as Profile[];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="font-serif text-3xl font-bold text-primary">Manage Users</h1>
      <AdminNav currentPath="/admin/users" />

      <Card>
        <CardHeader>
          <CardTitle>All Users ({userList.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {userList.map((user) => (
              <div key={user.id} className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="font-medium">{user.name}</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                  <p className="text-xs text-muted-foreground">
                    Joined {format(new Date(user.created_at), "MMM d, yyyy")}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={user.role === "admin" ? "default" : "outline"}>
                    {user.role}
                  </Badge>
                  <UserRoleToggle userId={user.id} currentRole={user.role} />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
