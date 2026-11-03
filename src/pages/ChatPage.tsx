import AppNav from "@/components/AppNav";
import FarmingChat from "@/components/FarmingChat";

export default function ChatPage() {
  return (
    <div className="h-[100dvh] flex flex-col bg-background overflow-hidden">
      <AppNav />
      <div className="flex-1 min-h-0 flex flex-col"><FarmingChat /></div>
    </div>
  );
}
