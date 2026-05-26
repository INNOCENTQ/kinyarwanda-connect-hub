import AppNav from "@/components/AppNav";
import FarmingChat from "@/components/FarmingChat";

export default function ChatPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AppNav />
      <div className="flex-1 flex flex-col"><FarmingChat /></div>
    </div>
  );
}
