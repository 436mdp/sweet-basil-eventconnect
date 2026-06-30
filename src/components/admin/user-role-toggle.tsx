"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { updateUserRole } from "@/lib/actions/auth";
import type { UserRole } from "@/types/database.types";

interface UserRoleToggleProps {
  userId: string;
  currentRole: UserRole;
}

export function UserRoleToggle({ userId, currentRole }: UserRoleToggleProps) {
  const router = useRouter();

  const toggle = async () => {
    const newRole = currentRole === "admin" ? "user" : "admin";
    const result = await updateUserRole(userId, newRole);
    if (result.error) toast.error(result.error);
    else {
      toast.success(`Role updated to ${newRole}`);
      router.refresh();
    }
  };

  return (
    <Button variant="outline" size="sm" onClick={toggle}>
      Make {currentRole === "admin" ? "User" : "Admin"}
    </Button>
  );
}
