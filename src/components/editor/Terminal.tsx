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
      <div className="terminal-toolbar p-3 bg-muted/30 flex justify-between items-center border-b border-border">
        <div className="font-medium text-sm flex items-center">
          <TerminalIcon className="h-4 w-4 mr-2" />
          Console Output
          {waitingForInput && (
            <span className="ml-2 text-xs bg-yellow-500/20 text-yellow-500 px-2 py-0.5 rounded-full animate-pulse">
              Waiting for input...
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
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Clear Console
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
        className="terminal-output-container flex-1 p-3 overflow-auto text-sm"
      >
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
          
          return (
            <div 
              key={index} 
              className={cn(
                "terminal-line mb-1 font-mono",
                isError ? "text-terminal-error" : 
                isPrompt ? "text-terminal-highlight" : 
                isSuccess ? "text-green-500" :
                isUserInput ? "text-cyan-400 font-semibold" :
                isInputSaved ? "text-blue-400 italic" :
                "text-terminal-text"
              )}
            >
              {line}
            </div>
          );
        })}
        
        {waitingForInput && (
          <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-md p-2 mt-2">
            <form onSubmit={handleInputSubmit} className="flex items-center">
              <div className="text-yellow-500 mr-2 font-bold">Input:</div>
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                className="terminal-input flex-1 bg-transparent border border-yellow-500/30 outline-none text-white focus:ring-1 focus:ring-yellow-500/50 px-2 py-1 rounded"
                placeholder="Type your input here and press Enter..."
                autoFocus
              />
              <button 
                type="submit" 
                className="ml-2 px-3 py-1 text-xs bg-yellow-500/20 text-yellow-500 rounded hover:bg-yellow-500/30 transition-colors"
                disabled={!inputValue.trim()}
              >
                Submit
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Terminal;
