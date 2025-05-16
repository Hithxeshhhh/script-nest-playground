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
  
  // Reference to keep track of the execution state
  const executionStateRef = useRef({
    isRunning: false,
    pendingInputResolvers: [] as Array<(value: string) => void>,
    shouldHalt: false,
    promptActive: false,
    debugMode: true // Enable debug mode to see what's happening
  });
  
  // JavaScript code interpreter
  const runCode = (code: string) => {
    // Reset output when starting a new run
    setOutput(['// Output will appear here', '> Running JavaScript program...']);
    
    // Reset execution state
    executionStateRef.current.isRunning = true;
    executionStateRef.current.pendingInputResolvers = [];
    executionStateRef.current.shouldHalt = false;
    executionStateRef.current.promptActive = false;
    setIsExecuting(true);
    
    // Define the global prompt function that will handle user input
    const userPrompt = async (message: string): Promise<string> => {
      return new Promise((resolve) => {
        // Display the prompt message
        setOutput(prev => [...prev, `> ${message}`]);
        
        // Check if we already have inputs in the queue
        if (inputQueue.length > 0) {
          const input = inputQueue.shift() || '';
          setInputQueue([...inputQueue]);
          // Show the input in the output with a special prefix
          setOutput(prev => [...prev, `« ${input}`]);
          if (executionStateRef.current.debugMode) {
            setOutput(prev => [...prev, `DEBUG: Using queued input: "${input}"`]);
          }
          resolve(input);
          return;
        }
        
        // No input available, wait for user
        executionStateRef.current.promptActive = true;
        setWaitingForInput(true);
        
        // Store the resolver to be called when input is received
        executionStateRef.current.pendingInputResolvers.push(resolve);
      });
    };
    
    // Define custom console object
    const userConsole = {
      log: (...args: any[]) => {
        const message = args.map(arg => {
          if (typeof arg === 'object') {
            try {
              return JSON.stringify(arg, null, 2);
            } catch (e) {
              return String(arg);
            }
          }
          return String(arg);
        }).join(' ');
        
        setOutput(prev => [...prev, message]);
      }
    };
    
    // Execute user code with proper async handling
    const executeUserCode = async () => {
      try {
        // Create a wrapper that correctly manages async operations
        const wrappedCode = `
          async function executeUserCode() {
            // Storage for user inputs to debug issues
            const userInputs = [];
            
            // Input handling function that awaits user input
            async function getUserInput(message) {
              try {
                const userInput = await prompt(message);
                userInputs.push(userInput);
                return userInput; // Return the raw input string
              } catch (e) {
                console.log("Error in prompt: " + e.message);
                return "";
              }
            }
            
            // Override parsing functions to handle input correctly
            // Save the original functions
            const originalParseInt = parseInt;
            const originalParseFloat = parseFloat;
            
            // Create safer versions of the parse functions
            const safeParseInt = function(str) {
              // If this is a string, try to clean it up
              if (typeof str === 'string') {
                str = str.trim();
                const parsed = originalParseInt(str);
                console.log("DEBUG: parseInt received: '" + str + "', returned: " + parsed);
                return parsed;
              }
              console.log("DEBUG: parseInt received non-string: " + typeof str);
              return originalParseInt(str);
            };
            
            const safeParseFloat = function(str) {
              if (typeof str === 'string') {
                str = str.trim();
                const parsed = originalParseFloat(str);
                console.log("DEBUG: parseFloat received: '" + str + "', returned: " + parsed);
                return parsed;
              }
              return originalParseFloat(str);
            };
            
            // Override only inside a scoped function instead of globally
            function runWithSafeNumberFunctions() {
              // Override the functions only inside this scope
              const originalPromptFunc = prompt;
              globalThis.prompt = getUserInput;
              
              // Override parse functions only within this scope
              globalThis.parseInt = safeParseInt;
              globalThis.parseFloat = safeParseFloat;
              
              return async function() {
                try {
                  // Run the actual user code
                  ${code}
                } finally {
                  // Restore original functions
                  globalThis.prompt = originalPromptFunc;
                  globalThis.parseInt = originalParseInt;
                  globalThis.parseFloat = originalParseFloat;
                }
              }();
            }
            
            try {
              // Run the code in a safer way that doesn't affect Number.isNaN
              await runWithSafeNumberFunctions();
              
              // If we got here, show any inputs that were processed
              if (userInputs.length > 0) {
                console.log("DEBUG: All inputs processed:", userInputs);
              }
            } catch (e) {
              console.log("Error: " + e.message);
            }
          }
          
          // Return the execution as a promise
          return executeUserCode();
        `;
        
        // Create a function with the correct context
        const executeFunction = new Function('prompt', 'console', wrappedCode);
        
        // Execute the code with our prompt and console implementations
        await executeFunction(userPrompt, userConsole);
        
        if (!executionStateRef.current.shouldHalt) {
          setOutput(prev => [...prev, '> Program completed successfully']);
        }
      } catch (error) {
        if (executionStateRef.current.shouldHalt) {
          return; // Don't show errors if we intentionally halted execution
        }
        
        if (error instanceof Error) {
          setOutput(prev => [...prev, `Error: ${error.message}`]);
        } else {
          setOutput(prev => [...prev, 'An unknown error occurred']);
        }
      } finally {
        if (!executionStateRef.current.shouldHalt) {
          executionStateRef.current.isRunning = false;
          executionStateRef.current.promptActive = false;
          setWaitingForInput(false);
          setIsExecuting(false);
        }
      }
    };
    
    // Start execution
    executeUserCode();
  };
  
  const handleRun = (code: string) => {
    // If there's already code running, halt it
    if (executionStateRef.current.isRunning) {
      executionStateRef.current.shouldHalt = true;
      
      // Resolve any pending inputs to unblock the previous execution
      executionStateRef.current.pendingInputResolvers.forEach(resolver => {
        resolver("");
      });
      executionStateRef.current.pendingInputResolvers = [];
      executionStateRef.current.promptActive = false;
      setWaitingForInput(false);
      setIsExecuting(false);
      
      // Wait a moment before starting new execution
      setTimeout(() => {
        // Clear any previous input queue
        setInputQueue([]);
        setCurrentCode(code);
        runCode(code);
      }, 100);
    } else {
      // Clear any previous input queue
      setInputQueue([]);
      setCurrentCode(code);
      runCode(code);
    }
  };
  
  const handleClearTerminal = () => {
    setOutput(['// Output cleared']);
    setWaitingForInput(false);
  };
  
  const handleUserInput = (input: string) => {
    // If there's a resolver waiting, resolve it with the input
    if (executionStateRef.current.pendingInputResolvers.length > 0) {
      const resolve = executionStateRef.current.pendingInputResolvers.shift()!;
      
      // Add the input to the output with a "«" prefix to distinguish it from program output
      setOutput(prev => [...prev, `« ${input}`]);
      
      if (executionStateRef.current.debugMode) {
        setOutput(prev => [...prev, `DEBUG: User input received: "${input}"`]);
      }
      
      // No longer waiting for input
      setWaitingForInput(false);
      executionStateRef.current.promptActive = false;
      
      // Resolve with the raw input
      resolve(input);
    } else {
      // No resolver waiting, just add to queue for future use
      setInputQueue(prev => [...prev, input]);
      setOutput(prev => [...prev, `Input saved: ${input}`]);
      setWaitingForInput(false);
    }
  };
  
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
