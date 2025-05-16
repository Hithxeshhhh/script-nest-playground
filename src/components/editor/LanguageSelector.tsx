
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { FileCode } from 'lucide-react';

export type ProgrammingLanguage = 'javascript' | 'python' | 'cpp' | 'csharp' | 'c';

interface LanguageSelectorProps {
  selectedLanguage: ProgrammingLanguage;
  onLanguageSelect: (language: ProgrammingLanguage) => void;
}

const languageOptions = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'python', label: 'Python' },
  { value: 'cpp', label: 'C++' },
  { value: 'c', label: 'C' },
  { value: 'csharp', label: 'C#' }
];

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ selectedLanguage, onLanguageSelect }) => {
  return (
    <Card className="h-full overflow-hidden">
      <CardHeader className="bg-primary/10 pb-3">
        <CardTitle className="flex items-center text-sm">
          <FileCode className="h-4 w-4 mr-2 text-primary" />
          Select Language
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <Select 
          value={selectedLanguage} 
          onValueChange={(value) => onLanguageSelect(value as ProgrammingLanguage)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select language" />
          </SelectTrigger>
          <SelectContent>
            {languageOptions.map((lang) => (
              <SelectItem key={lang.value} value={lang.value}>
                {lang.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <div className="mt-4 text-xs text-muted-foreground">
          <p className="mb-2">Choose a programming language to get started with coding.</p>
          <p>Each language has different syntax and use cases. Try them out to see which one you like!</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default LanguageSelector;
