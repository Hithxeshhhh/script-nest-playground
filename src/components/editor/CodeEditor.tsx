import CodeMirror from "@uiw/react-codemirror";
import React, { useEffect, useState } from "react";
import { javascript } from "@codemirror/lang-javascript";
import { oneDark } from "@codemirror/theme-one-dark";
import { Copy, Download, Play, Save, Share, Trash2 } from "lucide-react";
import type { ProgrammingLanguage } from "./LanguageSelector";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

// CodeMirror imports

// Local storage key
const CODE_STORAGE_KEY = 'codeBuddy_savedCode';

interface CodeEditorProps {
  onRun: (code: string) => void;
  onClear: () => void;
  language: ProgrammingLanguage;
  isExecuting?: boolean;
}

const getDefaultCode = (): string => {
  return `// Welcome to CodeBuddy - JavaScript Playground
// Write your code here and click Run Code to execute

console.log("Hello, world!");
`;
};

const CodeEditor: React.FC<CodeEditorProps> = ({ onRun, onClear, language, isExecuting = false }) => {
  // Try to load saved code from local storage or use default
  const [code, setCode] = useState<string>(() => {
    const savedCode = localStorage.getItem(CODE_STORAGE_KEY);
    return savedCode ? savedCode : getDefaultCode();
  });
  
  const { toast } = useToast();

  // Save code to local storage whenever it changes
  useEffect(() => {
    localStorage.setItem(CODE_STORAGE_KEY, code);
  }, [code]);

  const handleRunCode = () => {
    toast({
      title: `Running JavaScript code...`,
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
      a.download = `my-code.js`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Code saved!",
        description: `Your code has been downloaded as my-code.js`,
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

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code)
      .then(() => {
        toast({
          title: "Copied to clipboard",
          description: "Your code has been copied to clipboard",
          duration: 1500,
        });
      })
      .catch(() => {
        toast({
          title: "Failed to copy",
          description: "Could not copy code to clipboard",
          variant: "destructive",
          duration: 2000,
        });
      });
  };

  return (
    <div className="editor-container h-full flex flex-col rounded-lg overflow-hidden bg-editor-bg text-editor-text border border-border">
      <div className="editor-toolbar p-2 md:p-3 bg-muted/30 flex justify-between items-center border-b border-border flex-shrink-0">
        <div className="font-medium text-xs md:text-sm flex items-center">
          <span className="bg-primary/20 text-yellow-200 px-1 md:px-2 py-0.5 rounded text-[10px] md:text-xs font-mono mr-2">
            JAVASCRIPT
          </span>
          <span className="hidden sm:inline">CodeBuddy Editor</span>
        </div>
        <div className="space-x-1 md:space-x-2 flex items-center flex-wrap">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleCopyCode}
                  className="h-7 md:h-8 px-2 md:px-3 text-xs text-black"
                >
                  <Copy className="h-3 w-3 md:h-4 md:w-4 sm:mr-1" />
                  <span className="hidden sm:inline">Copy</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Copy code to clipboard</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleSaveCode}
                  className="h-7 md:h-8 px-2 md:px-3 text-xs text-black"
                >
                  <Download className="h-3 w-3 md:h-4 md:w-4 sm:mr-1" />
                  <span className="hidden sm:inline">Download</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Save code as file</p>
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
                  className="h-7 md:h-8 px-2 md:px-3 text-xs text-black"
                >
                  <Trash2 className="h-3 w-3 md:h-4 md:w-4 sm:mr-1" />
                  <span className="hidden sm:inline">Clear</span>
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
                  className={cn(
                    "bg-secondary hover:bg-secondary/90 text-secondary-foreground h-7 md:h-8 px-2 md:px-3 text-xs",
                    isExecuting && "animate-pulse bg-orange-600 hover:bg-orange-600"
                  )}
                  disabled={isExecuting}
                >
                  {isExecuting ? (
                    <>
                      <span className="mr-1 h-3 w-3 md:h-4 md:w-4 animate-spin">⟳</span>
                      <span className="hidden sm:inline">Running...</span>
                      <span className="sm:hidden">Run...</span>
                    </>
                  ) : (
                    <>
                      <Play className="h-3 w-3 md:h-4 md:w-4 sm:mr-1" />
                      <span className="hidden sm:inline">Run Code</span>
                      <span className="sm:hidden">Run</span>
                    </>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isExecuting ? "Code is currently running" : "Execute your code"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <div className="editor-content flex-1 overflow-hidden">
        <CodeMirror
          value={code}
          height="100%"
          onChange={setCode}
          extensions={[javascript({ jsx: true })]}
          theme={oneDark}
          basicSetup={{
            lineNumbers: true,
            highlightActiveLine: true,
            highlightSelectionMatches: true,
            autocompletion: true,
            foldGutter: true,
            indentOnInput: true,
            bracketMatching: true,
            closeBrackets: true,
            tabSize: 2,
          }}
          className="h-full text-sm"
        />
      </div>
      
      <div className="editor-footer p-2 bg-muted/10 border-t border-border flex justify-between text-xs text-muted-foreground flex-shrink-0">
        <div>
          {/* Reset button removed */}
        </div>
        <div>
          <span>JavaScript ES6 • Auto-save enabled</span>
        </div>
      </div>
    </div>
  );
};

export default CodeEditor;
