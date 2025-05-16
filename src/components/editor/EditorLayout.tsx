
import React, { useState, useEffect } from 'react';
import CodeEditor from './CodeEditor';
import Terminal from './Terminal';
import CodingHints from './CodingHints';
import LanguageSelector, { ProgrammingLanguage } from './LanguageSelector';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/components/ui/use-toast';
import { Settings } from 'lucide-react';

const EditorLayout: React.FC = () => {
  const [output, setOutput] = useState<string[]>(['// Output will appear here']);
  const [waitingForInput, setWaitingForInput] = useState<boolean>(false);
  const [currentCode, setCurrentCode] = useState<string>('');
  const [inputQueue, setInputQueue] = useState<string[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<ProgrammingLanguage>('javascript');
  const { toast } = useToast();
  
  // Mock JavaScript interpreter
  const runCode = (code: string) => {
    setOutput([...output, '> Running program...']);

    // Create a safe environment to run the code
    try {
      // Display different message based on language
      if (selectedLanguage !== 'javascript') {
        setOutput(prev => [...prev, `> Running ${selectedLanguage} code (simulation)...`]);
        setOutput(prev => [...prev, `// Note: This is a simplified simulation of ${selectedLanguage} execution`]);
        
        // Simple output simulation for non-JavaScript languages
        const lines = code.split('\n');
        const printLines = lines.filter(line => {
          const trimmedLine = line.trim().toLowerCase();
          return (
            (selectedLanguage === 'python' && (trimmedLine.startsWith('print(') || trimmedLine.startsWith('# output:'))) ||
            (selectedLanguage === 'cpp' && (trimmedLine.startsWith('cout') || trimmedLine.startsWith('// output:'))) ||
            (selectedLanguage === 'c' && (trimmedLine.startsWith('printf') || trimmedLine.startsWith('// output:'))) ||
            (selectedLanguage === 'csharp' && (trimmedLine.startsWith('console.writeline') || trimmedLine.startsWith('// output:')))
          );
        });
        
        // Extract some simulated output
        if (printLines.length > 0) {
          printLines.forEach(line => {
            if (line.includes('// output:')) {
              setOutput(prev => [...prev, line.split('// output:')[1].trim()]);
            } else if (line.includes('# output:')) {
              setOutput(prev => [...prev, line.split('# output:')[1].trim()]);
            } else {
              // Try to extract string literals from print statements as simulated output
              const match = line.match(/"([^"]+)"|'([^']+)'/);
              if (match) {
                setOutput(prev => [...prev, match[1] || match[2]]);
              }
            }
          });
        } else {
          setOutput(prev => [...prev, "// No output detected. Add print/cout statements to see output."]);
        }
        
        setOutput(prev => [...prev, '> Program completed successfully (simulated)']);
        return;
      }
      
      // JavaScript code execution (actual execution)
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
  
  const handleLanguageSelect = (language: ProgrammingLanguage) => {
    setSelectedLanguage(language);
    toast({
      title: `Switched to ${language}`,
      description: `Now coding in ${language} mode!`,
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
            language={selectedLanguage}
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
