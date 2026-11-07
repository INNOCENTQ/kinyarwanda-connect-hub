import AppNav from "@/components/AppNav";
import FarmPhotoSlides from "@/components/FarmPhotoSlides";
import FarmingChat from "@/components/FarmingChat";

export default function ChatPage() {
  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden bg-background">
      <AppNav />
      <main className="flex min-h-0 flex-1 flex-col gap-3 px-3 py-3 sm:gap-4 sm:px-6 sm:py-4" aria-label="AI farming and livestock assistant">
        <FarmPhotoSlides />
        <div className="mx-auto flex min-h-0 w-full max-w-5xl flex-1 flex-col overflow-hidden rounded-2xl border border-border bg-background">
          <FarmingChat />
        </div>
      </main>
    </div>
  );
}
