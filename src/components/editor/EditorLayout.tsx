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
  
  // Reference to keep track of global state
  const globals = useRef({
    pendingInputResolve: null as ((value: string) => void) | null,
    isRunning: false,
    userPrompt: null as ((message: string) => Promise<string>) | null,
    log: null as ((message: string) => void) | null
  });
  
  // Run the user's code
  const runCode = (code: string) => {
    // Reset terminal
    setOutput(['// Output will appear here', '> Running JavaScript program...']);
    setIsExecuting(true);
    setWaitingForInput(false);
    
    // Setup the logging function
    const logToTerminal = (message: string) => {
      setOutput(prev => [...prev, message]);
    };
    
    // Setup the prompt function
    const userPrompt = async (message: string): Promise<string> => {
      // Show the prompt message
      logToTerminal(`> ${message}`);
      
      // Set waiting state
      setWaitingForInput(true);
      
      // Return a promise that will be resolved when input is received
      return new Promise((resolve) => {
        globals.current.pendingInputResolve = (value: string) => {
          setWaitingForInput(false);
          // Only log the input once
          logToTerminal(`« ${value}`);
          resolve(value);
        };
      });
    };
    
    // Store globals for other functions to access
    globals.current.log = logToTerminal;
    globals.current.userPrompt = userPrompt;
    globals.current.isRunning = true;
    
    // Prepare a safe execution environment
    const executeInSandbox = async () => {
      try {
        // Save original functions
        const originalConsoleLog = console.log;
        const originalPrompt = window.prompt;
        
        // Override built-in functions
        console.log = function(...args) {
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
          
          // Log to terminal
          if (globals.current.log) {
            globals.current.log(message);
          }
          
          // Also log to browser console
          originalConsoleLog(...args);
        };
        
        // Override prompt
        window.prompt = function(message?: string): string {
          if (!message) return '';
          
          // Create a special marker that our execution system will recognize
          return `__AWAIT_PROMPT_${message}__`;
        };
        
        // Execute the code
        const wrappedCode = `
          async function __runUserCode() {
            try {
              // Create a new scope for user code
              const __userScope = {
                // Console methods
                console: {
                  log: (...args) => {
                    if (globals.current.log) {
                      globals.current.log(args.map(arg => {
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
                      }).join(' '));
                    }
                  },
                  error: (...args) => {
                    if (globals.current.log) {
                      globals.current.log('Error: ' + args.map(String).join(' '));
                    }
                  },
                  warn: (...args) => {
                    if (globals.current.log) {
                      globals.current.log('Warning: ' + args.map(String).join(' '));
                    }
                  },
                  info: (...args) => {
                    if (globals.current.log) {
                      globals.current.log('Info: ' + args.map(String).join(' '));
                    }
                  }
                },
                
                // Timer functions
                setTimeout: (fn, delay, ...args) => {
                  if (delay > 30000) {
                    throw new Error('setTimeout delay cannot exceed 30 seconds');
                  }
                  return setTimeout(fn, delay, ...args);
                },
                setInterval: (fn, delay, ...args) => {
                  if (delay > 30000) {
                    throw new Error('setInterval delay cannot exceed 30 seconds');
                  }
                  return setInterval(fn, delay, ...args);
                },
                clearTimeout,
                clearInterval,
                
                // Built-in objects and functions
                Object, Array, String, Number, Boolean, Date, Math, JSON, RegExp,
                parseInt, parseFloat, isNaN, isFinite,
                Error, TypeError, SyntaxError, ReferenceError,
                Map, Set, WeakMap, WeakSet,
                Promise, async, await,
                
                // Fetch API (with timeout)
                fetch: async (url, options = {}) => {
                  const controller = new AbortController();
                  const timeout = setTimeout(() => controller.abort(), 5000);
                  try {
                    const response = await fetch(url, { 
                      ...options, 
                      signal: controller.signal 
                    });
                    clearTimeout(timeout);
                    return response;
                  } catch (error) {
                    clearTimeout(timeout);
                    throw error;
                  }
                },
                
                // Local Storage API
                localStorage: {
                  getItem: (key) => localStorage.getItem(key),
                  setItem: (key, value) => {
                    if (typeof key !== 'string' || typeof value !== 'string') {
                      throw new Error('localStorage only accepts string values');
                    }
                    localStorage.setItem(key, value);
                  },
                  removeItem: (key) => localStorage.removeItem(key),
                  clear: () => localStorage.clear()
                },
                
                // Utility functions
                btoa: (str) => btoa(str),
                atob: (str) => atob(str),
                encodeURI,
                decodeURI,
                encodeURIComponent,
                decodeURIComponent
              };
              
              // Process the code to handle all prompts
              const code = \`${code.replace(/`/g, '\\`')}\`;
              let processedCode = code;
              const promptRegex = /prompt\\(["'](.+?)["']\\)/g;
              let match;
              
              while ((match = promptRegex.exec(code)) !== null) {
                const fullMatch = match[0];
                const promptMessage = match[1];
                const input = await globals.current.userPrompt(promptMessage);
                processedCode = processedCode.replace(fullMatch, JSON.stringify(input));
              }
              
              // Execute the processed code in the sandbox
              const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
              const userFunction = new AsyncFunction('__userScope', \`
                with (__userScope) {
                  try {
                    \${processedCode}
                  } catch (error) {
                    console.error(error.stack || error.message);
                  }
                }
              \`);
              
              await userFunction(__userScope);
              
            } catch (error) {
              if (globals.current.log) {
                globals.current.log(\`Runtime Error: \${error.message}\`);
                if (error.stack) {
                  globals.current.log(error.stack.split('\\n').slice(1).join('\\n'));
                }
              }
            }
          }
          __runUserCode();
        `;
        
        await eval(wrappedCode);
        
        // Restore original functions
        console.log = originalConsoleLog;
        window.prompt = originalPrompt;
        
        // Mark execution as complete
        finishExecution();
      } catch (error) {
        if (globals.current.log) {
          globals.current.log(`Execution error: ${error.message}`);
        }
        finishExecution();
      }
    };
    
    // Execute the code
    executeInSandbox();
  };
  
  // Finish execution and clean up
  const finishExecution = () => {
    globals.current.isRunning = false;
    setIsExecuting(false);
    
    // Show completion message if not waiting for input
    if (!waitingForInput && globals.current.log) {
      globals.current.log('> Program completed successfully');
    }
  };
  
  // Handle running the user's code
  const handleRun = (code: string) => {
    // If we're already running, clean up first
    if (globals.current.isRunning) {
      globals.current.isRunning = false;
      globals.current.pendingInputResolve = null;
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
    if (globals.current.pendingInputResolve) {
      const resolve = globals.current.pendingInputResolve;
      globals.current.pendingInputResolve = null;
      
      // No longer waiting for input
      setWaitingForInput(false);
      
      // Use setTimeout to ensure UI updates before continuing
      setTimeout(() => {
        resolve(input);
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
    <div className="editor-wrapper p-4 grid grid-cols-12 gap-4">
      {/* Left sidebar - Language Selector */}
      <div className="col-span-2 flex flex-col gap-4">
        <LanguageSelector 
          selectedLanguage={selectedLanguage} 
          onLanguageSelect={handleLanguageSelect}
        />
        
        <div className="mt-auto">
          <CodingHints language={selectedLanguage} />
        </div>
      </div>
      
      {/* Main content - Editor and Terminal */}
      <div className="col-span-10 grid grid-rows-2 gap-4 h-full">
        {/* Top row - Code Editor */}
        <div className="row-span-1">
          <CodeEditor 
            onRun={handleRun} 
            onClear={handleClearTerminal} 
            language={selectedLanguage}
            isExecuting={isExecuting}
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
