import { useState } from "react";
import { X, FlaskConical } from "lucide-react";
import { ROLE_LABELS, useRole } from "@/lib/auth-mock";

export function PreviewModeBanner() {
  const role = useRole();
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;
  return (
    <div className="mb-4 flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs text-foreground">
      <FlaskConical className="h-3.5 w-3.5 text-primary-glow" />
      <span>
        Preview Mode: viewing as{" "}
        <span className="font-semibold">{ROLE_LABELS[role]}</span>
      </span>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        className="ml-auto rounded-md p-1 text-muted-foreground hover:bg-background/40 hover:text-foreground"
        aria-label="Dismiss preview banner"
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  );
}
