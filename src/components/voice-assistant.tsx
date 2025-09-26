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


  // Word-by-word streaming animation
  const streamText = useCallback((text: string, messageIndex: number) => {
    const words = text.split(' ');
    let currentWordIndex = 0;
    
    const streamNextWord = () => {
      if (currentWordIndex < words.length) {
        const displayedText = words.slice(0, currentWordIndex + 1).join(' ');
        
        setConversation(prev => 
          prev.map((msg, idx) => 
            idx === messageIndex 
              ? { ...msg, displayedContent: displayedText, isStreaming: true }
              : msg
          )
        );
        
        currentWordIndex++;
        streamingTimeoutRef.current = setTimeout(streamNextWord, 100); // 100ms delay between words
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
        
        // Start streaming after a short delay
        setTimeout(() => streamText(response, messageIndex), 300);
        
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
        title: "Copied!",
        description: "Message copied to clipboard.",
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
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.8;
      utterance.pitch = 1;
      speechSynthesis.speak(utterance);
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

  // Format text with bold support
  const formatText = (text: string) => {
    // Split text by **bold** markers and create spans
    const parts = text.split(/(\*\*.*?\*\*)/g);
    
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        // Remove ** markers and make bold
        const boldText = part.slice(2, -2);
        return (
          <strong key={index} className="font-bold text-primary">
            {boldText}
          </strong>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl flex flex-col h-full sm:h-auto max-h-[90vh] w-full">
        <DialogHeader className="pb-4 border-b">
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Marine Assistant
          </DialogTitle>
          <DialogDescription>
            Ask questions about marine species, locations, and conservation. Supports **bold text** formatting.
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="flex-1 -mx-6 px-6 py-4" ref={scrollAreaRef}>
          <div className="space-y-6 min-h-[400px]">
            {conversation.length === 0 && (
              <div className="text-center text-muted-foreground pt-12">
                <Sparkles className="mx-auto h-12 w-12 mb-4 text-primary/50" />
                <h3 className="text-lg font-medium mb-2">Welcome to AI Marine Assistant</h3>
                <p className="text-sm">Start a conversation about marine species and conservation!</p>
                <div className="mt-6 grid grid-cols-1 gap-2 max-w-md mx-auto">
                  <div className="text-xs text-left p-2 bg-muted/50 rounded border-l-2 border-primary/30">
                    💡 Try: "Tell me about **endangered** marine species"
                  </div>
                  <div className="text-xs text-left p-2 bg-muted/50 rounded border-l-2 border-primary/30">
                    🐠 Try: "Where can I find **Bluefin Tuna**?"
                  </div>
                  <div className="text-xs text-left p-2 bg-muted/50 rounded border-l-2 border-primary/30">
                    📊 Try: "Show me **population trends** for sharks"
                  </div>
                </div>
              </div>
            )}
            
            {conversation.map((message, index) => (
              <div
                key={index}
                className={`flex items-start gap-3 ${
                  message.role === "user" ? "justify-end" : ""
                } group`}
              >
                {message.role === "model" && (
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground shadow-sm">
                    <Sparkles className="h-5 w-5" />
                  </div>
                )}
                
                <div className="flex flex-col gap-2 max-w-[80%]">
                  <div
                    className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "bg-background border shadow-sm"
                    }`}
                  >
                    {message.role === "model" ? (
                      <div className="space-y-1">
                        <div className="prose prose-sm max-w-none">
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
                      <div>{formatText(message.content)}</div>
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
                  <span className="text-muted-foreground">AI is thinking...</span>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        
        <div className="pt-4 border-t">
          <form onSubmit={handleSubmit} className="relative">
            <Input
              id="query"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder='Ask about marine species... (Use **text** for bold formatting)'
              className="pr-12 h-12 text-base"
              disabled={isLoading}
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
          <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
            <span>Press Enter to send • Use **text** for bold</span>
            <span>{conversation.length} messages</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
