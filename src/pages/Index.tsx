import EditorLayout from "@/components/editor/EditorLayout";
import { Info, Menu } from "lucide-react";
import { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

const Index = () => {
  const [showAlert, setShowAlert] = useState(true);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Input Instructions Alert */}
      {showAlert && (
        <div className="bg-blue-500/10 border-blue-500/30 border-b px-2 md:px-4 py-2">
          <div className="container mx-auto">
            <Alert variant="default" className="bg-transparent border-none p-0 flex flex-col md:flex-row md:items-center">
              <div className="flex items-start md:items-center">
                <Info className="h-4 w-4 text-blue-500 mr-2 mt-1 md:mt-0" />
                <div className="flex-1">
                  <AlertTitle className="text-sm font-medium text-blue-600 px-0">User Input Instructions</AlertTitle>
                  <AlertDescription className="text-xs text-muted-foreground">
                    To get user input in your code, use <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">prompt()</code>
                  </AlertDescription>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="md:ml-auto h-6 text-xs mt-2 md:mt-0 self-end md:self-auto" 
                onClick={() => setShowAlert(false)}
              >
                Dismiss
              </Button>
            </Alert>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-primary text-primary-foreground p-3 md:p-4 shadow-lg flex-shrink-0">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-white/20 rounded-full p-1 md:p-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 md:h-6 md:w-6">
                <polyline points="16 18 22 12 16 6"></polyline>
                <polyline points="8 6 2 12 8 18"></polyline>
              </svg>
            </div>
            <h1 className="text-lg md:text-xl font-bold">CodeBuddy</h1>
          </div>
          <div className="flex gap-2 md:gap-3">
            <Button size="sm" variant="secondary" className="text-xs md:text-sm px-2 md:px-3 h-8">Share</Button>
            <Button size="sm" variant="outline" className="bg-white/10 border-white/20 text-xs md:text-sm px-2 md:px-3 h-8">Help</Button>
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
