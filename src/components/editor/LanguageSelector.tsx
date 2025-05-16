import React from "react";
import { FileCode } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export type ProgrammingLanguage = 'javascript';

interface LanguageSelectorProps {
  selectedLanguage: ProgrammingLanguage;
  onLanguageSelect: (language: ProgrammingLanguage) => void;
}

const languageOptions = [
  { value: 'javascript', label: 'JavaScript' }
];

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ selectedLanguage, onLanguageSelect }) => {
  return (
    <Card className="h-full overflow-hidden">
      <CardHeader className="bg-primary/10 pb-3">
        <CardTitle className="flex items-center text-sm">
          <FileCode className="h-4 w-4 mr-2 text-primary" />
          Language
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <Select 
          value={selectedLanguage} 
          onValueChange={(value) => onLanguageSelect(value as ProgrammingLanguage)}
          disabled
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
          <p className="mb-2">JavaScript is the primary language for web development.</p>
          <p>It allows you to create interactive elements and dynamic content on websites.</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default LanguageSelector;
