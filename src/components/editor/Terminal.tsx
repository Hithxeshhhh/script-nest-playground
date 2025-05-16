
import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Trash2, Terminal as TerminalIcon } from "lucide-react";
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

  // Scroll to bottom when output changes
  useEffect(() => {
    if (outputContainerRef.current) {
      outputContainerRef.current.scrollTop = outputContainerRef.current.scrollHeight;
    }
  }, [output]);

  // Focus input when waiting for input
  useEffect(() => {
    if (waitingForInput && inputRef.current) {
      inputRef.current.focus();
    }
  }, [waitingForInput]);

  const handleInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onInput(inputValue);
      setInputValue("");
    }
  };

  return (
    <div className="terminal-container h-full flex flex-col rounded-lg overflow-hidden bg-terminal-bg text-terminal-text border border-border">
      <div className="terminal-toolbar p-3 bg-muted/30 flex justify-between items-center border-b border-border">
        <div className="font-medium text-sm flex items-center">
          <TerminalIcon className="h-4 w-4 mr-2" />
          Console Output
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
          // Check if line is a success message (usually starts with '>>')
          const isCommand = line.startsWith(">");
          
          return (
            <div 
              key={index} 
              className={cn(
                "terminal-line mb-1 font-mono",
                isError ? "text-terminal-error" : 
                isCommand ? "text-terminal-highlight" : "text-terminal-text"
              )}
            >
              {line}
            </div>
          );
        })}
        
        {waitingForInput && (
          <form onSubmit={handleInputSubmit} className="flex">
            <span className="text-terminal-highlight mr-2">{">"}</span>
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="terminal-input flex-1 bg-transparent border-none outline-none text-terminal-text"
              placeholder="Type here..."
              autoFocus
            />
          </form>
        )}
      </div>
    </div>
  );
};

export default Terminal;
