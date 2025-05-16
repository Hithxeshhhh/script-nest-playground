
import React, { useState, useEffect } from 'react';
import CodeEditor from './CodeEditor';
import Terminal from './Terminal';
import FileExplorer from './FileExplorer';
import CodingHints from './CodingHints';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/components/ui/use-toast';
import { Settings } from 'lucide-react';

const EditorLayout: React.FC = () => {
  const [output, setOutput] = useState<string[]>(['// Output will appear here']);
  const [waitingForInput, setWaitingForInput] = useState<boolean>(false);
  const [currentCode, setCurrentCode] = useState<string>('');
  const [inputQueue, setInputQueue] = useState<string[]>([]);
  const { toast } = useToast();
  
  // Mock JavaScript interpreter
  const runCode = (code: string) => {
    setOutput([...output, '> Running program...']);

    // Create a safe environment to run the code
    try {
      // Override prompt and console.log
      const sandbox: any = {};
      
      // Custom prompt implementation
      sandbox.prompt = (message: string) => {
        setOutput(prev => [...prev, `> ${message}`]);
        setWaitingForInput(true);
        
        // This is a synchronous operation in a real browser,
        // but we need to handle it asynchronously here
        if (inputQueue.length > 0) {
          const input = inputQueue.shift();
          setInputQueue([...inputQueue]);
          return input;
        }
        
        // Return a placeholder - this will be replaced when input arrives
        return "[waiting for input]";
      };
      
      // Custom console.log
      sandbox.console = {
        log: (...args: any[]) => {
          const message = args.map(arg => {
            if (typeof arg === 'object') {
              return JSON.stringify(arg);
            }
            return String(arg);
          }).join(' ');
          
          setOutput(prev => [...prev, message]);
        }
      };
      
      // Run the code in a somewhat safe way
      const scriptWithOverrides = `
        // Override globals
        const prompt = sandbox.prompt;
        const console = sandbox.console;
        
        // Run user code
        ${code}
      `;
      
      const runScript = new Function('sandbox', scriptWithOverrides);
      runScript(sandbox);
      
      // If no errors, show success message
      setOutput(prev => [...prev, '> Program completed successfully']);
    } catch (error) {
      // Show any errors
      if (error instanceof Error) {
        setOutput(prev => [...prev, `Error: ${error.message}`]);
      } else {
        setOutput(prev => [...prev, 'An unknown error occurred']);
      }
    }
  };
  
  const handleRun = (code: string) => {
    setCurrentCode(code);
    runCode(code);
  };
  
  const handleClearTerminal = () => {
    setOutput(['// Output cleared']);
    setWaitingForInput(false);
  };
  
  const handleUserInput = (input: string) => {
    setOutput(prev => [...prev, input]);
    setWaitingForInput(false);
    setInputQueue([...inputQueue, input]);
    
    // Re-run the code with the new input
    if (currentCode) {
      setTimeout(() => {
        runCode(currentCode);
      }, 100);
    }
  };
  
  const handleFileSelect = (content: string) => {
    setCurrentCode(content);
  };

  return (
    <div className="editor-wrapper p-4 grid grid-cols-12 gap-4">
      {/* Left sidebar - File Explorer */}
      <div className="col-span-2 flex flex-col gap-4">
        <FileExplorer onSelectFile={handleFileSelect} />
        
        <div className="mt-auto">
          <CodingHints />
        </div>
      </div>
      
      {/* Main content - Editor and Terminal */}
      <div className="col-span-10 grid grid-rows-2 gap-4 h-full">
        {/* Top row - Code Editor */}
        <div className="row-span-1">
          <CodeEditor 
            onRun={handleRun} 
            onClear={handleClearTerminal} 
          />
        </div>
        
        {/* Bottom row - Terminal */}
        <div className="row-span-1">
          <Terminal 
            output={output} 
            onClear={handleClearTerminal} 
            onInput={handleUserInput}
            waitingForInput={waitingForInput}
          />
        </div>
      </div>
    </div>
  );
};

export default EditorLayout;
