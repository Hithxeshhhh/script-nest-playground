
import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Play, Save, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import type { ProgrammingLanguage } from "./LanguageSelector";

interface CodeEditorProps {
  onRun: (code: string) => void;
  onClear: () => void;
  language: ProgrammingLanguage;
}

const getDefaultCodeForLanguage = (language: ProgrammingLanguage): string => {
  switch (language) {
    case 'javascript':
      return '// Welcome to JavaScript!\n\nfunction greet(name) {\n  return "Hello, " + name + "!";\n}\n\nconst message = greet("World");\nconsole.log(message);\n\n// You can also get user input:\n// const name = prompt("What\'s your name?");\n// console.log("Nice to meet you, " + name + "!");';
    
    case 'python':
      return '# Welcome to Python!\n\ndef greet(name):\n    return "Hello, " + name + "!"\n\nmessage = greet("World")\nprint(message)  # output: Hello, World!\n\n# You can also get user input:\n# name = input("What\'s your name?")\n# print("Nice to meet you, " + name + "!")';
    
    case 'cpp':
      return '// Welcome to C++!\n\n#include <iostream>\n#include <string>\nusing namespace std;\n\nstring greet(string name) {\n    return "Hello, " + name + "!";\n}\n\nint main() {\n    string message = greet("World");\n    cout << message << endl;  // output: Hello, World!\n    \n    // You can also get user input:\n    // string name;\n    // cout << "What\'s your name? ";\n    // cin >> name;\n    // cout << "Nice to meet you, " << name << "!";\n    \n    return 0;\n}';
    
    case 'c':
      return '// Welcome to C!\n\n#include <stdio.h>\n#include <string.h>\n\nvoid greet(char* name, char* result) {\n    strcpy(result, "Hello, ");\n    strcat(result, name);\n    strcat(result, "!");\n}\n\nint main() {\n    char message[100];\n    greet("World", message);\n    printf("%s\\n", message);  // output: Hello, World!\n    \n    // You can also get user input:\n    // char name[50];\n    // printf("What\'s your name? ");\n    // scanf("%s", name);\n    // printf("Nice to meet you, %s!\\n", name);\n    \n    return 0;\n}';
    
    case 'csharp':
      return '// Welcome to C#!\n\nusing System;\n\nclass Program {\n    static string Greet(string name) {\n        return "Hello, " + name + "!";\n    }\n    \n    static void Main() {\n        string message = Greet("World");\n        Console.WriteLine(message);  // output: Hello, World!\n        \n        // You can also get user input:\n        // Console.Write("What\'s your name? ");\n        // string name = Console.ReadLine();\n        // Console.WriteLine("Nice to meet you, " + name + "!");\n    }\n}';
    
    default:
      return '// Select a language to get started!';
  }
};

const CodeEditor: React.FC<CodeEditorProps> = ({ onRun, onClear, language }) => {
  const [code, setCode] = useState<string>(getDefaultCodeForLanguage(language));
  const [lineNumbers, setLineNumbers] = useState<number[]>([]);
  const [activeLineNumber, setActiveLineNumber] = useState<number | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  // Update code when language changes
  useEffect(() => {
    setCode(getDefaultCodeForLanguage(language));
  }, [language]);

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
      title: `Running ${language} code...`,
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
      
      // Set appropriate file extension based on language
      const fileExtensions: Record<ProgrammingLanguage, string> = {
        javascript: 'js',
        python: 'py',
        cpp: 'cpp',
        c: 'c',
        csharp: 'cs'
      };
      
      a.download = `my-code.${fileExtensions[language]}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Code saved!",
        description: `Your code has been downloaded as my-code.${fileExtensions[language]}`,
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
        <div className="font-medium text-sm flex items-center">
          <span className="bg-primary/20 text-primary px-2 py-0.5 rounded text-xs font-mono mr-2">
            {language.toUpperCase()}
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
