import { AppShell } from "@/components/shell/AppShell";
import { PageScaffold } from "@/features/scaffold/PageScaffold";

export default function PostCommentsPage() {
  return (
    <AppShell>
      <PageScaffold
        title="Comments"
        subtitle="Comment threads will be loaded from Supabase and updated in realtime."
      />
    </AppShell>
  );
}
