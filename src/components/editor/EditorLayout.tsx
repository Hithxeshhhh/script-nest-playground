import CodeEditor from "./CodeEditor";
import CodingHints from "./CodingHints";
import LanguageSelector, { ProgrammingLanguage } from "./LanguageSelector";
import React, { useEffect, useRef, useState } from "react";
import Terminal from "./Terminal";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

const EditorLayout: React.FC = () => {
  const [output, setOutput] = useState<string[]>(['// Output will appear here']);
  const [waitingForInput, setWaitingForInput] = useState<boolean>(false);
  const [currentCode, setCurrentCode] = useState<string>('');
  const [inputQueue, setInputQueue] = useState<string[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<ProgrammingLanguage>('javascript');
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const { toast } = useToast();
  
  // Reference to execution state and functions
  const executionRef = useRef({
    isRunning: false,
    inputResolver: null as ((value: string) => void) | null,
    clearTimeouts: [] as number[],
    clearIntervals: [] as number[],
  });
  
  // Run the user's code
  const runCode = async (code: string) => {
    // Reset terminal and set state
    setOutput(['// Output will appear here', '> Running JavaScript program...']);
    setIsExecuting(true);
    setWaitingForInput(false);
    
    // Clear any previous execution state
    executionRef.current.clearTimeouts.forEach(id => window.clearTimeout(id));
    executionRef.current.clearIntervals.forEach(id => window.clearInterval(id));
    executionRef.current.clearTimeouts = [];
    executionRef.current.clearIntervals = [];
    executionRef.current.isRunning = true;
    executionRef.current.inputResolver = null;
    
    // Create a log function that updates the terminal
    const log = (message: string) => {
      if (!executionRef.current.isRunning) return;
      setOutput(prev => [...prev, message]);
    };
    
    // Create a prompt function that will resolve with user input
    const promptAsync = async (message: string): Promise<string> => {
      if (!executionRef.current.isRunning) return '';
      
      // Display the prompt in the terminal
      log(`> ${message}`);
      setWaitingForInput(true);
      
      // Return a promise that will be resolved when input is received
      return new Promise<string>((resolve) => {
        executionRef.current.inputResolver = (value: string) => {
          if (!executionRef.current.isRunning) return;
          setWaitingForInput(false);
          resolve(value);
        };
      });
    };
    
    // Save original functions
    const originalConsoleLog = console.log;
    const originalPrompt = window.prompt;
    const originalSetTimeout = window.setTimeout;
    const originalSetInterval = window.setInterval;
    
    try {
      // Override console.log
      console.log = function(...args) {
        originalConsoleLog(...args);
        const message = args.map(arg => {
          if (arg === null) return 'null';
          if (arg === undefined) return 'undefined';
          if (typeof arg === 'object') {
            try {
              return JSON.stringify(arg, null, 2);
            } catch {
              return String(arg);
            }
          }
          return String(arg);
        }).join(' ');
        log(message);
      };
      
      // Override window.prompt
      window.prompt = function(message = '') {
        if (!executionRef.current.isRunning) return '';
        
        // This is a synchronous function, but we need to handle async input
        // Return a placeholder that our execution system will recognize
        throw new Error('__PROMPT_NEEDS_ASYNC__');
      };
      
      // Override setTimeout to track IDs for cleanup
      window.setTimeout = function(handler: TimerHandler, timeout?: number, ...args: any[]): number {
        if (timeout && timeout > 30000) {
          throw new Error('setTimeout delay cannot exceed 30 seconds');
        }
        const id = originalSetTimeout(handler, timeout, ...args);
        executionRef.current.clearTimeouts.push(id);
        return id;
      } as typeof setTimeout;
      
      // Override setInterval to track IDs for cleanup
      window.setInterval = function(handler: TimerHandler, timeout?: number, ...args: any[]): number {
        if (timeout && timeout > 30000) {
          throw new Error('setInterval delay cannot exceed 30 seconds');
        }
        const id = originalSetInterval(handler, timeout, ...args);
        executionRef.current.clearIntervals.push(id);
        return id;
      } as typeof setInterval;
      
      // Create a wrapper for async evaluation
      const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
      
      // Prepare and transform the user code
      let transformedCode = code;
      
      // Replace all prompt calls with await promptAsync calls
      // This is a simplified approach - a more robust solution would use a proper parser
      transformedCode = transformedCode.replace(
        /prompt\(\s*(['"`])(.*?)\1\s*\)/g, 
        'await promptAsync($1$2$1)'
      );
      
      // Create the execution function with user code
      const userAsyncFunction = new AsyncFunction(
        'promptAsync',
        `
        try {
          ${transformedCode}
        } catch (error) {
          if (error.message === '__PROMPT_NEEDS_ASYNC__') {
            console.error('Error: prompt() cannot be used directly. Please use await prompt() or handle the Promise.');
          } else {
            console.error('Runtime Error:', error.message);
          }
        }
        `
      );
      
      // Execute the function
      await userAsyncFunction(promptAsync);
      
      // Mark execution as complete
      if (executionRef.current.isRunning) {
        log('> Program completed successfully');
      }
    } catch (error) {
      // Handle any uncaught errors
      log(`Error: ${error.message}`);
    } finally {
      // Cleanup
      console.log = originalConsoleLog;
      window.prompt = originalPrompt;
      window.setTimeout = originalSetTimeout;
      window.setInterval = originalSetInterval;
      
      executionRef.current.isRunning = false;
      setIsExecuting(false);
      setWaitingForInput(false);
    }
  };
  
  // Handle running the user's code
  const handleRun = (code: string) => {
    // If we're already running, clean up first
    if (executionRef.current.isRunning) {
      executionRef.current.isRunning = false;
      executionRef.current.inputResolver = null;
      setWaitingForInput(false);
      setIsExecuting(false);
      
      // Wait a bit before starting new execution
      setTimeout(() => {
        setInputQueue([]);
        setCurrentCode(code);
        runCode(code);
      }, 100);
    } else {
      // Start fresh execution
      setInputQueue([]);
      setCurrentCode(code);
      runCode(code);
    }
  };
  
  // Handle clearing the terminal
  const handleClearTerminal = () => {
    setOutput(['// Output cleared']);
    setWaitingForInput(false);
  };
  
  // Handle user input
  const handleUserInput = (input: string) => {
    // Check if we have a pending input request
    if (executionRef.current.inputResolver) {
      // Get the resolver function
      const resolver = executionRef.current.inputResolver;
      executionRef.current.inputResolver = null;
      
      // Log the input
      setOutput(prev => [...prev, `« ${input}`]);
      
      // Resolve the promise with the input
      setTimeout(() => {
        resolver(input);
      }, 10);
    } else {
      // No pending request, queue the input
      setInputQueue(prev => [...prev, input]);
      setOutput(prev => [...prev, `Input saved: ${input}`]);
    }
  };
  
  // Handle language selection
  const handleLanguageSelect = (language: ProgrammingLanguage) => {
    setSelectedLanguage(language);
    toast({
      title: `Using JavaScript`,
      description: `JavaScript is the only available language.`,
      duration: 2000,
    });
  };

  return (
    <div className="editor-wrapper h-full min-h-[800px] p-4 grid grid-cols-1 md:grid-cols-12 gap-4">
      {/* Left sidebar - Language Selector and Coding Hints */}
      <div className="md:col-span-2 flex flex-col gap-4 overflow-y-auto order-2 md:order-1">
        <div className="flex md:flex-col gap-4 md:gap-0">
          <div className="flex-1 min-h-[200px] md:min-h-[40%] md:max-h-[45%] overflow-y-auto">
            <LanguageSelector 
              selectedLanguage={selectedLanguage} 
              onLanguageSelect={handleLanguageSelect}
            />
          </div>
          
          <div className="flex-1 min-h-[200px] md:min-h-[50%] md:max-h-[55%] overflow-y-auto">
            <CodingHints language={selectedLanguage} />
          </div>
        </div>
      </div>
      
      {/* Main content - Editor and Terminal */}
      <div className="md:col-span-10 flex flex-col gap-4 h-full order-1 md:order-2">
        {/* Top row - Code Editor */}
        <div className="flex-grow min-h-[350px] overflow-hidden">
          <CodeEditor 
            onRun={handleRun} 
            onClear={handleClearTerminal} 
            language={selectedLanguage}
            isExecuting={isExecuting}
          />
        </div>
        
        {/* Bottom row - Terminal */}
        <div className="h-[350px] min-h-[200px] md:min-h-[250px] max-h-[45%] flex-shrink-0">
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
