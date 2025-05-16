
import EditorLayout from "@/components/editor/EditorLayout";
import { Button } from "@/components/ui/button";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-primary text-primary-foreground p-4 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-white/20 rounded-full p-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
                <polyline points="16 18 22 12 16 6"></polyline>
                <polyline points="8 6 2 12 8 18"></polyline>
              </svg>
            </div>
            <h1 className="text-xl font-bold">CodeBuddy</h1>
          </div>
          <div className="flex gap-3">
            <Button size="sm" variant="secondary">Share</Button>
            <Button size="sm" variant="outline" className="bg-white/10 border-white/20">Help</Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <EditorLayout />
      </main>
    </div>
  );
};

export default Index;
