"use client";

import { findFishLocationFlowWithConversation } from "@/ai/flows/voice-activated-fish-finder";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Mic, Send, Sparkles, User, Copy, Volume2 } from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";

type Message = {
  role: "user" | "model";
  content: string;
  isStreaming?: boolean;
  displayedContent?: string;
};

export function VoiceAssistant({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversation, setConversation] = useState<Message[]>([]);
  const [streamingMessageIndex, setStreamingMessageIndex] = useState<number | null>(null);
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const streamingTimeoutRef = useRef<NodeJS.Timeout>();
  const inputRef = useRef<HTMLInputElement>(null);


  // Fast word-by-word streaming animation
  const streamText = useCallback((text: string, messageIndex: number) => {
    const words = text.split(' ');
    let currentWordIndex = 0;
    
    const streamNextWord = () => {
      if (currentWordIndex < words.length) {
        // Stream multiple words at once for faster display
        const wordsToAdd = Math.min(3, words.length - currentWordIndex);
        const displayedText = words.slice(0, currentWordIndex + wordsToAdd).join(' ');
        
        setConversation(prev => 
          prev.map((msg, idx) => 
            idx === messageIndex 
              ? { ...msg, displayedContent: displayedText, isStreaming: true }
              : msg
          )
        );
        
        currentWordIndex += wordsToAdd;
        streamingTimeoutRef.current = setTimeout(streamNextWord, 30); // Much faster 30ms delay
      } else {
        // Streaming complete
        setConversation(prev => 
          prev.map((msg, idx) => 
            idx === messageIndex 
              ? { ...msg, displayedContent: text, isStreaming: false }
              : msg
          )
        );
        setStreamingMessageIndex(null);
      }
    };
    
    streamNextWord();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: query };
    setConversation((prev) => [...prev, userMessage]);
    setQuery("");
    setIsLoading(true);

    try {
      const response = await findFishLocationFlowWithConversation(query);
      
      // Add the model message with empty displayed content initially
      const modelMessage: Message = { 
        role: "model", 
        content: response, 
        displayedContent: "",
        isStreaming: true 
      };
      
      setConversation((prev) => {
        const newConversation = [...prev, modelMessage];
        const messageIndex = newConversation.length - 1;
        setStreamingMessageIndex(messageIndex);
        
        // Start streaming immediately
        setTimeout(() => streamText(response, messageIndex), 50);
        
        return newConversation;
      });
      
    } catch (error) {
      console.error("AI Error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to get a response from the AI assistant.",
      });
      setConversation((prev) =>
        prev.filter((msg) => msg.content !== userMessage.content)
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Copy message to clipboard
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied",
        description: "Response copied to clipboard.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to copy message.",
      });
    }
  };

  // Text-to-speech
  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      // Stop any current speech
      speechSynthesis.cancel();
      
      // Clean text for speech (remove markdown)
      const cleanText = text.replace(/\*\*(.*?)\*\*/g, '$1');
      
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 0.8;
      utterance.pitch = 1;
      utterance.volume = 0.8;
      
      // Add some personality to the voice
      const voices = speechSynthesis.getVoices();
      const preferredVoice = voices.find(voice => 
        voice.name.includes('Google') || 
        voice.name.includes('Microsoft') ||
        voice.lang.startsWith('en')
      );
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
      
      speechSynthesis.speak(utterance);
      
      toast({
        title: "Audio Playback",
        description: "Playing response audio.",
      });
    } else {
      toast({
        variant: "destructive",
        title: "Not Supported",
        description: "Text-to-speech is not supported in this browser.",
      });
    }
  };

  // Auto-scroll to bottom when new messages arrive or during streaming
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTo({
          top: scrollElement.scrollHeight,
          behavior: 'smooth'
        });
      }
    }
  }, [conversation]);

  // Cleanup streaming timeout on unmount
  useEffect(() => {
    return () => {
      if (streamingTimeoutRef.current) {
        clearTimeout(streamingTimeoutRef.current);
      }
    };
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return;
      
      // Ctrl/Cmd + K to focus input
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
      
      // Escape to close dialog
      if (e.key === 'Escape' && !isLoading) {
        onOpenChange(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, isLoading, onOpenChange]);

  // Clear conversation
  const clearConversation = () => {
    setConversation([]);
    toast({
      title: "History Cleared",
      description: "Conversation history has been reset.",
    });
  };

  // Format text with bold support
  const formatText = (text: string) => {
    // Split text by **bold** markers and create spans
    const parts = text.split(/(\*\*.*?\*\*)/g);
    
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        // Remove ** markers and make bold
        const boldText = part.slice(2, -2);
        return (
          <strong key={index} className="font-bold text-primary break-words">
            {boldText}
          </strong>
        );
      }
      return <span key={index} className="break-words">{part}</span>;
    });
  };


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl flex flex-col max-h-[90vh] w-full overflow-hidden"
        style={{ height: '80vh' }}
      >
        <DialogHeader className="pb-4 border-b">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                AI Marine Assistant
              </DialogTitle>
              <DialogDescription>
                Ask questions about marine species, locations, and conservation.
              </DialogDescription>
            </div>
            {conversation.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearConversation}
                className="text-xs"
              >
                Clear Chat
              </Button>
            )}
          </div>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full" ref={scrollAreaRef}>
            <div className="px-6 py-4">
              <div className="space-y-6">
            {conversation.length === 0 && (
              <div className="text-center text-muted-foreground pt-12">
                <Sparkles className="mx-auto h-12 w-12 mb-4 text-primary/50" />
                <h3 className="text-lg font-medium mb-2">Marine Species Assistant</h3>
                <p className="text-sm mb-6">Ask questions about marine biodiversity, species locations, and conservation status.</p>
                <div className="grid grid-cols-1 gap-3 max-w-lg mx-auto">
                  <div className="text-sm text-left p-3 bg-muted/50 rounded-lg border-l-2 border-primary/30">
                    "What endangered species are found in the Indian Ocean?"
                  </div>
                  <div className="text-sm text-left p-3 bg-muted/50 rounded-lg border-l-2 border-primary/30">
                    "Show me population data for Bluefin Tuna"
                  </div>
                  <div className="text-sm text-left p-3 bg-muted/50 rounded-lg border-l-2 border-primary/30">
                    "Which marine habitats have the highest biodiversity?"
                  </div>
                </div>
              </div>
            )}
            
            {conversation.map((message, index) => (
              <div
                key={index}
                className={`flex items-start gap-3 w-full ${
                  message.role === "user" ? "justify-end" : ""
                } group`}
              >
                {message.role === "model" && (
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground shadow-sm">
                    <Sparkles className="h-5 w-5" />
                  </div>
                )}
                
                <div className="flex flex-col gap-2 max-w-[75%] min-w-0">
                  <div
                    className={`rounded-2xl px-4 py-3 text-sm leading-relaxed break-words ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "bg-background border shadow-sm"
                    }`}
                  >
                    {message.role === "model" ? (
                      <div className="space-y-1">
                        <div 
                          className="prose prose-sm max-w-none break-words overflow-wrap-anywhere"
                          style={{ 
                            wordWrap: 'break-word', 
                            overflowWrap: 'break-word',
                            wordBreak: 'break-word',
                            hyphens: 'auto'
                          }}
                        >
                          {formatText(message.displayedContent || message.content)}
                        </div>
                        {message.isStreaming && (
                          <div className="flex items-center gap-1 mt-2">
                            <div className="w-1 h-1 bg-primary rounded-full animate-pulse"></div>
                            <div className="w-1 h-1 bg-primary rounded-full animate-pulse delay-100"></div>
                            <div className="w-1 h-1 bg-primary rounded-full animate-pulse delay-200"></div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div 
                        className="break-words overflow-wrap-anywhere"
                        style={{ 
                          wordWrap: 'break-word', 
                          overflowWrap: 'break-word',
                          wordBreak: 'break-word',
                          hyphens: 'auto'
                        }}
                      >
                        {formatText(message.content)}
                      </div>
                    )}
                  </div>
                  
                  {message.role === "model" && !message.isStreaming && (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs"
                        onClick={() => copyToClipboard(message.content)}
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        Copy
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs"
                        onClick={() => speakText(message.content)}
                      >
                        <Volume2 className="h-3 w-3 mr-1" />
                        Speak
                      </Button>
                    </div>
                  )}
                </div>
                
                {message.role === "user" && (
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-muted flex items-center justify-center shadow-sm">
                    <User className="h-5 w-5" />
                  </div>
                )}
              </div>
            ))}
            
            {isLoading && (
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground shadow-sm">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div className="rounded-2xl px-4 py-3 text-sm bg-background border shadow-sm flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <span className="text-muted-foreground">Analyzing...</span>
                </div>
              </div>
            )}
              </div>
            </div>
          </ScrollArea>
        </div>
        
        <div className="pt-4 border-t">
          <form onSubmit={handleSubmit} className="relative">
            <Input
              ref={inputRef}
              id="query"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask about marine species, conservation, or biodiversity..."
              className="pr-12 h-12 text-base"
              disabled={isLoading}
              autoFocus
            />
            <Button
              type="submit"
              size="icon"
              className="absolute right-1 top-1/2 h-10 w-10 -translate-y-1/2"
              disabled={isLoading || !query.trim()}
              aria-label="Submit query"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
          <div className="flex items-center justify-end mt-2 text-xs text-muted-foreground">
            <span>{conversation.length} {conversation.length === 1 ? 'message' : 'messages'}</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
