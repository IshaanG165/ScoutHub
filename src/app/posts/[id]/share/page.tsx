import { AppShell } from "@/components/shell/AppShell";
import { PageScaffold } from "@/features/scaffold/PageScaffold";

export default function PostSharePage() {
  return (
    <AppShell>
      <PageScaffold
        title="Share"
        subtitle="Sharing will be enabled next (copy link, social, or direct message)."
      />
    </AppShell>
  );
}
