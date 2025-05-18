import React from "react";
import { Clock, FileCode } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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

// Languages coming soon
const comingSoonLanguages = [
  { value: 'python', label: 'Python' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'cpp', label: 'C++' },
  { value: 'java', label: 'Java' }
];

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ selectedLanguage, onLanguageSelect }) => {
  return (
    <Card className="h-full overflow-hidden border-primary/20">
      <CardHeader className="bg-primary/10 pb-3">
        <CardTitle className="flex items-center text-sm">
          <FileCode className="h-4 w-4 mr-2 text-primary" />
          Language
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-3 pb-2 flex flex-col h-[calc(100%-48px)] overflow-y-auto">
        <div className="mb-2">
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
          
          <Badge variant="outline" className="mt-2 bg-primary/5 text-primary border-primary/30">
            JavaScript Only
          </Badge>
        </div>
        
        <div className="text-xs text-muted-foreground mb-3">
          <p>Currently, only JavaScript is available. More languages coming soon!</p>
        </div>
        
        <div className="mt-auto border-t border-border/30 pt-2">
          <h4 className="text-xs font-medium flex items-center mb-1">
            <Clock className="h-3 w-3 mr-1 text-muted-foreground" />
            <span>Coming Soon</span>
          </h4>
          <div className="flex flex-wrap gap-1">
            {comingSoonLanguages.map(lang => (
              <Badge key={lang.value} variant="secondary" className="opacity-60">
                {lang.label}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LanguageSelector;
