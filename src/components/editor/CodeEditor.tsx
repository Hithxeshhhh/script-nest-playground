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
  return `// Welcome to CodeBuddy - A Modern JavaScript Playground!

// 1. Basic Input/Output
const name = prompt("What's your name?");
console.log(\`Hello, \${name}! Let's explore JavaScript features.\`);

// 2. Working with Arrays
const numbers = [1, 2, 3, 4, 5];
console.log('Original array:', numbers);

// Using modern array methods
const doubled = numbers.map(n => n * 2);
console.log('Doubled numbers:', doubled);

const sum = numbers.reduce((a, b) => a + b, 0);
console.log('Sum of numbers:', sum);

// 3. Async Operations
async function fetchJoke() {
  try {
    console.log('Fetching a programming joke...');
    const response = await fetch('https://v2.jokeapi.dev/joke/Programming?safe-mode');
    const joke = await response.json();
    
    if (joke.type === 'single') {
      console.log('Joke:', joke.joke);
    } else {
      console.log('Setup:', joke.setup);
      console.log('Punchline:', joke.delivery);
    }
  } catch (error) {
    console.error('Failed to fetch joke:', error.message);
  }
}

// 4. Timer Example
console.log('\\nStarting a timer...');
let counter = 0;
const timerId = setInterval(() => {
  counter++;
  console.log(\`Timer tick: \${counter}\`);
  
  if (counter >= 3) {
    clearInterval(timerId);
    console.log('Timer stopped!');
    
    // After timer, fetch a joke
    fetchJoke();
  }
}, 1000);

// 5. Error Handling
try {
  // Intentional error
  const obj = null;
  obj.nonexistent();
} catch (error) {
  console.error('Caught an error:', error.message);
}

// 6. Local Storage
const visits = parseInt(localStorage.getItem('visits') || '0') + 1;
localStorage.setItem('visits', visits.toString());
console.log(\`You have run this code \${visits} time(s)!\`);

// Try modifying this code or write your own!
// Features available:
// - Full ES6+ support
// - Async/await
// - Fetch API
// - Timer functions
// - Local Storage
// - Console methods (log, error, warn, info)
// - And much more!`;
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
  
  const handleResetToDefault = () => {
    if (confirm("Reset to default example code? This will replace your current code.")) {
      setCode(getDefaultCode());
      toast({
        title: "Reset to default",
        description: "Code has been reset to the default example",
        duration: 2000,
      });
    }
  };

  return (
    <div className="editor-container h-full flex flex-col rounded-lg overflow-hidden bg-editor-bg text-editor-text border border-border">
      <div className="editor-toolbar p-3 bg-muted/30 flex justify-between items-center border-b border-border">
        <div className="font-medium text-sm flex items-center">
          <span className="bg-primary/20 text-primary px-2 py-0.5 rounded text-xs font-mono mr-2">
            JAVASCRIPT
          </span>
          CodeBuddy Editor
        </div>
        <div className="space-x-2 flex items-center">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleCopyCode}
                >
                  <Copy className="h-4 w-4 mr-1" />
                  Copy
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
                >
                  <Download className="h-4 w-4 mr-1" />
                  Download
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
                  className={cn(
                    "bg-secondary hover:bg-secondary/90 text-secondary-foreground",
                    isExecuting && "animate-pulse bg-orange-600 hover:bg-orange-600"
                  )}
                  disabled={isExecuting}
                >
                  {isExecuting ? (
                    <>
                      <span className="mr-1 h-4 w-4 animate-spin">⟳</span>
                      Running...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-1" />
                      Run Code
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
      
      <div className="editor-footer p-2 bg-muted/10 border-t border-border flex justify-between text-xs text-muted-foreground">
        <div>
          <button onClick={handleResetToDefault} className="hover:text-primary transition-colors">
            Reset to Example
          </button>
        </div>
        <div>
          <span>JavaScript ES6 • Auto-save enabled</span>
        </div>
      </div>
    </div>
  );
};

export default CodeEditor;
