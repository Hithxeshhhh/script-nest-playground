
import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Play, Save, Trash2, Settings } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

interface CodeEditorProps {
  onRun: (code: string) => void;
  onClear: () => void;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ onRun, onClear }) => {
  const [code, setCode] = useState<string>(
    '// Welcome to CodeBuddy!\n// Try running this sample program:\n\nfunction greet(name) {\n  return "Hello, " + name + "!";\n}\n\nconst message = greet("World");\nconsole.log(message);\n\n// You can also get user input:\n// const name = prompt("What\'s your name?");\n// console.log("Nice to meet you, " + name + "!");'
  );
  const [lineNumbers, setLineNumbers] = useState<number[]>([]);
  const [activeLineNumber, setActiveLineNumber] = useState<number | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  // Generate line numbers whenever code changes
  useEffect(() => {
    const lines = code.split("\n").length;
    setLineNumbers(Array.from({ length: lines }, (_, i) => i + 1));
  }, [code]);

  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCode(e.target.value);
  };

  const handleRunCode = () => {
    toast({
      title: "Running code...",
      description: "Your program is now executing!",
      duration: 2000,
    });
    onRun(code);
  };

  const handleClearCode = () => {
    if (confirm("Are you sure you want to clear your code?")) {
      setCode("");
      onClear();
    }
  };

  const handleSaveCode = () => {
    try {
      const blob = new Blob([code], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "my-code.js";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Code saved!",
        description: "Your code has been downloaded as my-code.js",
        duration: 2000,
      });
    } catch (error) {
      toast({
        title: "Error saving code",
        description: "There was a problem saving your code.",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const start = textareaRef.current!.selectionStart;
      const end = textareaRef.current!.selectionEnd;
      
      // Insert 2 spaces at cursor position
      const newCode = 
        code.substring(0, start) + 
        "  " + 
        code.substring(end);
      
      setCode(newCode);
      
      // Move cursor after the inserted spaces
      setTimeout(() => {
        textareaRef.current!.selectionStart = start + 2;
        textareaRef.current!.selectionEnd = start + 2;
      }, 0);
    }
  };

  return (
    <div className="editor-container h-full flex flex-col rounded-lg overflow-hidden bg-editor-bg text-editor-text border border-border">
      <div className="editor-toolbar p-3 bg-muted/30 flex justify-between items-center border-b border-border">
        <div className="font-medium text-sm">CodeBuddy Editor</div>
        <div className="space-x-2 flex items-center">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleSaveCode}
                >
                  <Save className="h-4 w-4 mr-1" />
                  Save
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Save your code</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleClearCode}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Clear
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Clear editor</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  onClick={handleRunCode} 
                  className="bg-secondary hover:bg-secondary/90 text-secondary-foreground animate-float"
                >
                  <Play className="h-4 w-4 mr-1" />
                  Run Code
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Execute your code</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <div className="editor-content flex-1 flex overflow-hidden">
        <div className="line-numbers bg-editor-bg p-2 text-sm font-mono">
          {lineNumbers.map((num) => (
            <div
              key={num}
              className={cn("line-number", activeLineNumber === num && "active")}
            >
              {num}
            </div>
          ))}
        </div>
        <textarea
          ref={textareaRef}
          value={code}
          onChange={handleCodeChange}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-editor-bg text-editor-text p-2 outline-none resize-none text-sm font-mono"
          spellCheck="false"
        />
      </div>
    </div>
  );
};

export default CodeEditor;
