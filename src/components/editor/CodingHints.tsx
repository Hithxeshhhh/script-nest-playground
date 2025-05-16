import React, { useEffect, useState } from "react";
import { Lightbulb } from "lucide-react";
import { ProgrammingLanguage } from "./LanguageSelector";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface CodingHint {
  id: number;
  title: string;
  content: React.ReactNode;
  category: 'beginner' | 'syntax' | 'best-practice';
}

interface CodingHintsProps {
  language: ProgrammingLanguage;
}

const hints: CodingHint[] = [
  // JavaScript hints
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
  {
    id: 5,
    title: 'JavaScript Arrays',
    content: (
      <div>
        <p className="mb-2">Arrays store collections of values:</p>
        <pre className="bg-muted p-2 rounded my-2 text-xs">{"const fruits = [\"Apple\", \"Banana\", \"Orange\"];\n\n// Accessing array elements\nconsole.log(fruits[0]); // Apple\n\n// Adding to an array\nfruits.push(\"Mango\");\n\n// Array methods\nconst fruitsString = fruits.join(\", \");\nconsole.log(fruitsString);"}</pre>
        <p>Arrays have many built-in methods to manipulate data!</p>
      </div>
    ),
    category: 'beginner'
  },
  {
    id: 6,
    title: 'JavaScript Objects',
    content: (
      <div>
        <p className="mb-2">Objects store data with named properties:</p>
        <pre className="bg-muted p-2 rounded my-2 text-xs">{"const person = {\n  name: \"John\",\n  age: 30,\n  city: \"New York\"\n};\n\n// Accessing properties\nconsole.log(person.name); // John\nconsole.log(person[\"age\"]); // 30\n\n// Adding properties\nperson.job = \"Developer\";"}</pre>
        <p>Objects are fundamental structures in JavaScript!</p>
      </div>
    ),
    category: 'beginner'
  },
  {
    id: 7,
    title: 'Using Loops',
    content: (
      <div>
        <p className="mb-2">Loops let you repeat code:</p>
        <pre className="bg-muted p-2 rounded my-2 text-xs">{"// For loop\nfor (let i = 0; i < 5; i++) {\n  console.log(`Loop count: ${i}`);\n}\n\n// While loop\nlet count = 0;\nwhile (count < 3) {\n  console.log(`Count: ${count}`);\n  count++;\n}\n\n// Loop through array\nconst numbers = [1, 2, 3];\nnumbers.forEach(num => console.log(num));"}</pre>
        <p>Different loop types serve different purposes!</p>
      </div>
    ),
    category: 'beginner'
  },
  {
    id: 8,
    title: 'Template Literals',
    content: (
      <div>
        <p className="mb-2">Template literals make string formatting easier:</p>
        <pre className="bg-muted p-2 rounded my-2 text-xs">{"const name = \"John\";\nconst age = 30;\n\n// Old way\nconsole.log(\"Hello, my name is \" + name + \" and I am \" + age + \" years old.\");\n\n// Using template literals\nconsole.log(`Hello, my name is ${name} and I am ${age} years old.`);"}</pre>
        <p>The backtick (`) syntax allows for more readable strings with variables!</p>
      </div>
    ),
    category: 'beginner'
  }
];

const CodingHints: React.FC<CodingHintsProps> = ({ language }) => {
  const [currentHint, setCurrentHint] = useState<CodingHint | null>(null);

  // Get a random hint
  const getRandomHint = () => {
    const randomIndex = Math.floor(Math.random() * hints.length);
    setCurrentHint(hints[randomIndex]);
  };

  useEffect(() => {
    getRandomHint();
  }, []); // Only run once on component mount

  return (
    <Card className="h-full overflow-hidden">
      <CardHeader className="bg-primary/10 pb-3">
        <CardTitle className="flex items-center text-sm">
          <Lightbulb className="h-4 w-4 mr-2 text-primary" />
          JavaScript Tips
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
