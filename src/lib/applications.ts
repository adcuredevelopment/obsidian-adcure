import { useCallback, useEffect, useState } from "react";
import { supabase } from "./supabase";
import type { Database } from "./database.types";

export type Application = Database["public"]["Tables"]["account_applications"]["Row"];
export type ApplicationStatus = "pending" | "approved" | "rejected";

// ============================================
// FETCH APPLICATIONS
// ============================================

/**
 * Hook to fetch all account applications.
 * Uses manual refetch (no realtime subscriptions).
 * Call refetch() after any mutation to update the UI.
 */
export function useApplications() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from("account_applications")
        .select("*")
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;
      setApplications(data ?? []);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to load applications";
      setError(msg);
      console.error("Error fetching applications:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return {
    applications,
    loading,
    error,
    refetch,
    pending: applications.filter((a) => a.status === "pending"),
    approved: applications.filter((a) => a.status === "approved"),
    rejected: applications.filter((a) => a.status === "rejected"),
  };
}

// ============================================
// APPROVE APPLICATION
// ============================================

type ApproveResult =
  | { success: true; organizationId: string; userId: string; tempPassword: string }
  | { success: false; error: string };

export async function approveApplication(
  applicationId: string
): Promise<ApproveResult> {
  try {
    const { data: app, error: fetchError } = await supabase
      .from("account_applications")
      .select("*")
      .eq("id", applicationId)
      .single();

    if (fetchError || !app) {
      return { success: false, error: "Application not found" };
    }

    if (app.status !== "pending") {
      return {
        success: false,
        error: `Application is already ${app.status}`,
      };
    }

    const {
      data: { user: adminUser },
    } = await supabase.auth.getUser();

    if (!adminUser) {
      return { success: false, error: "Not authenticated" };
    }

    // Create organization
    const { data: organization, error: orgError } = await supabase
      .from("organizations")
      .insert({
        name: app.company_name,
        kvk_number: app.kvk_number,
        vat_number: app.vat_number,
        iban: app.iban,
        status: "active",
        default_fee_percentage: 5.0,
      })
      .select()
      .single();

    if (orgError || !organization) {
      return {
        success: false,
        error: `Failed to create organization: ${orgError?.message}`,
      };
    }

    const tempPassword = generateTemporaryPassword();

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: app.contact_email,
      password: tempPassword,
      options: {
        data: {
          full_name: app.contact_name,
          organization_id: organization.id,
        },
      },
    });

    if (authError || !authData.user) {
      await supabase.from("organizations").delete().eq("id", organization.id);
      return {
        success: false,
        error: `Failed to create auth user: ${authError?.message}`,
      };
    }

    // Create public.users row
    const { error: userError } = await supabase.from("users").insert({
      id: authData.user.id,
      organization_id: organization.id,
      email: app.contact_email,
      full_name: app.contact_name,
      phone: app.contact_phone,
      role: "client",
      status: "active",
      terms_accepted_version: app.terms_accepted_version,
      terms_accepted_at: app.terms_accepted_at,
    });

    if (userError) {
      await supabase.from("organizations").delete().eq("id", organization.id);
      return {
        success: false,
        error: `Failed to create user profile: ${userError.message}`,
      };
    }

    // Update application status
    const { error: updateError } = await supabase
      .from("account_applications")
      .update({
        status: "approved",
        organization_id: organization.id,
        reviewed_by: adminUser.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", applicationId);

    if (updateError) {
      console.error("Warning: Failed to update application status:", updateError);
    }

    // Audit log
    await supabase.from("audit_log").insert({
      event_type: "application.approved",
      event_category: "admin",
      initiated_by: adminUser.id,
      organization_id: organization.id,
      description: `Application for ${app.company_name} approved`,
      data: {
        application_id: applicationId,
        company_name: app.company_name,
        kvk_number: app.kvk_number,
      },
    });

    return {
      success: true,
      organizationId: organization.id,
      userId: authData.user.id,
      tempPassword,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return { success: false, error: msg };
  }
}

// ============================================
// REJECT APPLICATION
// ============================================

type RejectResult = { success: true } | { success: false; error: string };

export async function rejectApplication(
  applicationId: string,
  reason: string
): Promise<RejectResult> {
  try {
    const {
      data: { user: adminUser },
    } = await supabase.auth.getUser();

    if (!adminUser) {
      return { success: false, error: "Not authenticated" };
    }

    const { data: app } = await supabase
      .from("account_applications")
      .select("company_name, kvk_number")
      .eq("id", applicationId)
      .single();

    const { error } = await supabase
      .from("account_applications")
      .update({
        status: "rejected",
        rejection_reason: reason.trim(),
        reviewed_by: adminUser.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", applicationId);

    if (error) {
      return { success: false, error: error.message };
    }

    await supabase.from("audit_log").insert({
      event_type: "application.rejected",
      event_category: "admin",
      initiated_by: adminUser.id,
      description: `Application for ${app?.company_name ?? "Unknown"} rejected`,
      data: {
        application_id: applicationId,
        company_name: app?.company_name,
        rejection_reason: reason,
      },
    });

    return { success: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return { success: false, error: msg };
  }
}

// ============================================
// UTILITIES
// ============================================

function generateTemporaryPassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  const special = "!@#$%&*";
  let password = "";
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  password += special.charAt(Math.floor(Math.random() * special.length));
  return password;
}

export function calculateAvgReviewTime(applications: Application[]): string {
  const reviewed = applications.filter(
    (a) => a.reviewed_at && a.created_at
  );

  if (reviewed.length === 0) return "N/A";

  const totalMs = reviewed.reduce((sum, app) => {
    const created = new Date(app.created_at!).getTime();
    const reviewedTime = new Date(app.reviewed_at!).getTime();
    return sum + (reviewedTime - created);
  }, 0);

  const avgHours = totalMs / reviewed.length / (1000 * 60 * 60);

  if (avgHours < 1) return `${Math.round(avgHours * 60)}m`;
  if (avgHours < 24) return `${avgHours.toFixed(1)}h`;
  return `${Math.round(avgHours / 24)}d`;
}

export function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = Date.now();
  const diffMs = now - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) return "just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}