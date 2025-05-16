
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { FileText, Save, Trash2, Plus } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface File {
  id: string;
  name: string;
  content: string;
}

interface FileExplorerProps {
  onSelectFile: (content: string) => void;
}

const FileExplorer: React.FC<FileExplorerProps> = ({ onSelectFile }) => {
  const [files, setFiles] = useState<File[]>([
    { 
      id: '1', 
      name: 'example.js', 
      content: '// Welcome to CodeBuddy!\n// Try running this sample program:\n\nfunction greet(name) {\n  return "Hello, " + name + "!";\n}\n\nconst message = greet("World");\nconsole.log(message);\n\n// You can also get user input:\n// const name = prompt("What\'s your name?");\n// console.log("Nice to meet you, " + name + "!");' 
    }
  ]);
  const [selectedFileId, setSelectedFileId] = useState<string>('1');
  const [newFileName, setNewFileName] = useState<string>('');
  const [isCreatingFile, setIsCreatingFile] = useState<boolean>(false);
  
  const { toast } = useToast();

  const handleSelectFile = (id: string) => {
    const file = files.find(f => f.id === id);
    if (file) {
      setSelectedFileId(id);
      onSelectFile(file.content);
    }
  };

  const handleCreateFile = () => {
    if (isCreatingFile && newFileName) {
      // Check if file name already exists
      if (files.some(file => file.name === newFileName)) {
        toast({
          title: "File already exists",
          description: `A file with name "${newFileName}" already exists`,
          variant: "destructive"
        });
        return;
      }
      
      // Add new file
      const newFile = {
        id: Date.now().toString(),
        name: newFileName,
        content: `// ${newFileName}\n// Created on ${new Date().toLocaleDateString()}\n\n`
      };
      
      setFiles([...files, newFile]);
      setSelectedFileId(newFile.id);
      onSelectFile(newFile.content);
      setIsCreatingFile(false);
      setNewFileName('');
      
      toast({
        title: "File created",
        description: `Created new file "${newFileName}"`,
      });
    } else {
      setIsCreatingFile(true);
    }
  };

  const handleDeleteFile = (id: string) => {
    // Prevent deleting the last file
    if (files.length <= 1) {
      toast({
        title: "Cannot delete file",
        description: "You must have at least one file",
        variant: "destructive"
      });
      return;
    }
    
    const fileToDelete = files.find(f => f.id === id);
    if (!fileToDelete) return;
    
    if (confirm(`Are you sure you want to delete "${fileToDelete.name}"?`)) {
      const newFiles = files.filter(file => file.id !== id);
      setFiles(newFiles);
      
      // If deleted the selected file, select the first one
      if (id === selectedFileId && newFiles.length > 0) {
        setSelectedFileId(newFiles[0].id);
        onSelectFile(newFiles[0].content);
      }
      
      toast({
        title: "File deleted",
        description: `Deleted "${fileToDelete.name}"`,
      });
    }
  };

  const handleUpdateFileContent = (content: string) => {
    const updatedFiles = files.map(file => {
      if (file.id === selectedFileId) {
        return { ...file, content };
      }
      return file;
    });
    setFiles(updatedFiles);
  };

  return (
    <div className="file-explorer p-3 bg-muted/30 rounded-lg border border-border h-full overflow-auto">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-medium text-sm">Files</h3>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={handleCreateFile}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Create a new file</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      {isCreatingFile && (
        <div className="mb-3 flex">
          <Input
            value={newFileName}
            onChange={(e) => setNewFileName(e.target.value)}
            placeholder="filename.js"
            className="text-sm mr-2"
            autoFocus
          />
          <Button 
            size="sm" 
            onClick={handleCreateFile}
          >
            Save
          </Button>
        </div>
      )}
      
      <div className="space-y-1">
        {files.map((file) => (
          <div
            key={file.id}
            className={`flex items-center justify-between p-2 rounded-md cursor-pointer ${selectedFileId === file.id ? 'bg-accent text-accent-foreground' : 'hover:bg-muted'}`}
            onClick={() => handleSelectFile(file.id)}
          >
            <div className="flex items-center text-sm">
              <FileText className="h-4 w-4 mr-2 text-primary" />
              {file.name}
            </div>
            {selectedFileId === file.id && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteFile(file.id);
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Delete this file</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FileExplorer;
