"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { addCommunityPost, getCommunityPosts, getImageUrl } from "@/lib/data";
import { type Post } from "@/lib/types";
import { MessageCircle, ThumbsUp, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";

function PostCard({ post }: { post: Post }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-4">
        <Avatar>
          <AvatarImage
            src={getImageUrl(post.avatarId)}
            data-ai-hint="person portrait"
          />
          <AvatarFallback>
            {post.author.charAt(0)}
            {post.author.split(" ")[1]?.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-semibold">{post.author}</p>
          <p className="text-sm text-muted-foreground">{post.time}</p>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-foreground/90 whitespace-pre-wrap">{post.content}</p>
      </CardContent>
      <CardFooter className="flex gap-4">
        <Button variant="ghost" size="sm" className="flex items-center gap-2">
          <ThumbsUp className="w-4 h-4" />
          <span>{post.likes} Likes</span>
        </Button>
        <Button variant="ghost" size="sm" className="flex items-center gap-2">
          <MessageCircle className="w-4 h-4" />
          <span>{post.comments} Comments</span>
        </Button>
      </CardFooter>
    </Card>
  );
}

export default function CommunityPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPostContent, setNewPostContent] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isPosting, setIsPosting] = useState(false);

  useEffect(() => {
    const fetchPosts = async () => {
      setIsLoading(true);
      const fetchedPosts = await getCommunityPosts();
      setPosts(fetchedPosts);
      setIsLoading(false);
    };
    fetchPosts();
  }, []);

  const handlePostSubmit = async () => {
    if (!newPostContent.trim()) return;
    setIsPosting(true);
    const newPost = await addCommunityPost(newPostContent);
    setPosts([newPost, ...posts]);
    setNewPostContent("");
    setIsPosting(false);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold tracking-tight mb-6">Community Hub</h1>

      <Card className="mb-8">
        <CardHeader>
          <h2 className="text-lg font-semibold">Share an Update</h2>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="What's on your mind? Share catch reports, research updates, or ask a question."
            value={newPostContent}
            onChange={(e) => setNewPostContent(e.target.value)}
            disabled={isPosting}
          />
        </CardContent>
        <CardFooter>
          <Button onClick={handlePostSubmit} disabled={isPosting}>
            {isPosting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Post Update
          </Button>
        </CardFooter>
      </Card>

      <div className="space-y-6">
        {isLoading ? (
          <div className="text-center py-8">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground mt-2">Loading posts...</p>
          </div>
        ) : (
          posts.map((post) => <PostCard key={post.id} post={post} />)
        )}
      </div>
    </div>
  );
}
