
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Lightbulb } from 'lucide-react';

interface CodingHint {
  id: number;
  title: string;
  content: React.ReactNode;
  category: 'beginner' | 'syntax' | 'best-practice';
}

const hints: CodingHint[] = [
  {
    id: 1,
    title: 'Using Console.log',
    content: (
      <div>
        <p className="mb-2">Use <code className="bg-muted p-0.5 rounded">console.log()</code> to print values to the console:</p>
        <pre className="bg-muted p-2 rounded my-2 text-xs">{"console.log(\"Hello World!\");"}</pre>
        <p>This is great for debugging and seeing the values of your variables!</p>
      </div>
    ),
    category: 'beginner'
  },
  {
    id: 2,
    title: 'Getting User Input',
    content: (
      <div>
        <p className="mb-2">You can use <code className="bg-muted p-0.5 rounded">prompt()</code> to ask the user for input:</p>
        <pre className="bg-muted p-2 rounded my-2 text-xs">{"const name = prompt(\"What is your name?\");\nconsole.log(\"Hello, \" + name + \"!\");"}</pre>
        <p>This will show a popup asking for input!</p>
      </div>
    ),
    category: 'beginner'
  },
  {
    id: 3,
    title: 'Using Functions',
    content: (
      <div>
        <p className="mb-2">Functions help organize your code into reusable blocks:</p>
        <pre className="bg-muted p-2 rounded my-2 text-xs">{"function sayHello(name) {\n  return \"Hello, \" + name + \"!\";\n}\n\n// Using the function\nconsole.log(sayHello(\"Alex\"));"}</pre>
        <p>Functions are like mini-programs inside your program!</p>
      </div>
    ),
    category: 'beginner'
  },
  {
    id: 4,
    title: 'Using If Statements',
    content: (
      <div>
        <p className="mb-2">Use if statements to make decisions in your code:</p>
        <pre className="bg-muted p-2 rounded my-2 text-xs">{"const age = prompt(\"How old are you?\");\nif (age >= 18) {\n  console.log(\"You are an adult!\");\n} else {\n  console.log(\"You are a minor.\");\n}"}</pre>
        <p>This lets your program take different paths based on conditions!</p>
      </div>
    ),
    category: 'beginner'
  },
];

const CodingHints: React.FC = () => {
  const [currentHint, setCurrentHint] = useState<CodingHint | null>(null);

  // Get a random hint initially and when Next button is clicked
  const getRandomHint = () => {
    const randomIndex = Math.floor(Math.random() * hints.length);
    setCurrentHint(hints[randomIndex]);
  };

  useEffect(() => {
    getRandomHint();
  }, []);

  return (
    <Card className="h-full overflow-hidden">
      <CardHeader className="bg-primary/10 pb-3">
        <CardTitle className="flex items-center text-sm">
          <Lightbulb className="h-4 w-4 mr-2 text-primary" />
          Coding Tips
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 text-sm">
        {currentHint && (
          <>
            <h3 className="font-medium mb-2">{currentHint.title}</h3>
            <div className="prose prose-sm">{currentHint.content}</div>
          </>
        )}
      </CardContent>
      <CardFooter className="border-t pt-3 pb-3">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={getRandomHint} 
          className="w-full"
        >
          Next Tip
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CodingHints;
