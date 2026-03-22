import { AppShell } from "@/components/shell/AppShell";
import { FeedPage } from "@/features/feed/FeedPage";

export default function Page() {
  return (
    <AppShell>
      <FeedPage />
    </AppShell>
  );
}
