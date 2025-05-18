import React, { useEffect, useRef, useState } from "react";
import { Terminal as TerminalIcon, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface TerminalProps {
  output: string[];
  onClear: () => void;
  onInput: (input: string) => void;
  waitingForInput: boolean;
}

const Terminal: React.FC<TerminalProps> = ({ 
  output, 
  onClear, 
  onInput, 
  waitingForInput 
}) => {
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const outputContainerRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when output changes or waiting for input
  useEffect(() => {
    if (outputContainerRef.current) {
      outputContainerRef.current.scrollTop = outputContainerRef.current.scrollHeight;
    }
  }, [output, waitingForInput]);

  // Focus input when waiting for input
  useEffect(() => {
    if (waitingForInput && inputRef.current) {
      inputRef.current.focus();
    }
  }, [waitingForInput]);

  const handleInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onInput(inputValue.trim());
      setInputValue("");
    }
  };

  // Add keyboard shortcut for submitting input with Enter
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (inputValue.trim()) {
        onInput(inputValue.trim());
        setInputValue("");
      }
    }
  };

  return (
    <div className="terminal-container h-full flex flex-col rounded-lg overflow-hidden bg-terminal-bg text-terminal-text border border-border">
      <div className={cn(
        "terminal-toolbar p-2 md:p-3 flex justify-between items-center border-b border-border",
        waitingForInput ? "bg-yellow-500/20" : "bg-muted/30"
      )}>
        <div className="font-medium text-xs md:text-sm flex items-center">
          <TerminalIcon className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
          Console Output
          {waitingForInput && (
            <span className="ml-2 text-xs bg-yellow-500 text-black px-2 py-0.5 rounded-full animate-pulse">
              Input Required
            </span>
          )}
        </div>
        <div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onClear}
                  className="h-7 md:h-8 px-2 md:px-3 text-xs"
                >
                  <Trash2 className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                  <span className="hidden sm:inline">Clear Console</span>
                  <span className="sm:hidden">Clear</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Clear console output</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <div 
        ref={outputContainerRef}
        className={cn(
          "terminal-output-container flex-1 p-2 md:p-3 overflow-y-auto overflow-x-auto text-xs md:text-sm max-h-[calc(100%-50px)]",
          waitingForInput && "border-l-4 border-yellow-500"
        )}
        style={{ scrollbarWidth: 'thin', scrollbarColor: '#4a5568 #2d3748' }}
      >
        <div className="terminal-content">
          {output.map((line, index) => {
            // Check if line is an error message
            const isError = line.includes("Error") || line.includes("error");
            // Check if line is a system/prompt message (starts with '>')
            const isPrompt = line.startsWith(">") && !line.includes("Program completed");
            // Check if line is a success message
            const isSuccess = line.includes("> Program completed");
            // Check if it's user input (starts with "«")
            const isUserInput = line.startsWith("«");
            // Check if it's an input saved message
            const isInputSaved = line.includes("Input saved:");
            // Check if it's debug output we want to hide
            const isDebug = line.includes("DEBUG:");
            
            if (isDebug) return null; // Skip debug messages in output
            
            return (
              <div 
                key={index} 
                className={cn(
                  "terminal-line mb-1 font-mono",
                  isError ? "text-terminal-error" : 
                  isPrompt ? "text-terminal-highlight font-bold" : 
                  isSuccess ? "text-green-500" :
                  isUserInput ? "text-cyan-400 font-semibold bg-cyan-500/10 px-2 py-1 rounded" :
                  isInputSaved ? "text-blue-400 italic" :
                  "text-terminal-text"
                )}
              >
                {line}
              </div>
            );
          })}
        </div>
        
        {waitingForInput && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-md p-3 mt-2 animate-pulse">
            <form onSubmit={handleInputSubmit} className="flex flex-col gap-2">
              <div className="text-yellow-500 font-bold flex items-center">
                <span className="mr-2">⌨️</span>
                Input Required:
              </div>
              <div className="flex items-center">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="terminal-input flex-1 bg-transparent border border-yellow-500/50 outline-none text-white focus:ring-2 focus:ring-yellow-500/70 px-3 py-2 rounded text-base"
                  placeholder="Type your input here and press Enter..."
              autoFocus
            />
                <button 
                  type="submit" 
                  className="ml-2 px-4 py-2 bg-yellow-500/80 text-black rounded hover:bg-yellow-500 transition-colors font-medium"
                  disabled={!inputValue.trim()}
                >
                  Submit
                </button>
              </div>
          </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Terminal;
