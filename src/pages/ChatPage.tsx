import AppNav from "@/components/AppNav";
import FarmingChat from "@/components/FarmingChat";

export default function ChatPage() {
  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden bg-background">
      <AppNav />
      <main className="flex min-h-0 flex-1 flex-col" aria-label="AI farming and livestock assistant">
        <FarmingChat />
      </main>
    </div>
  );
}
