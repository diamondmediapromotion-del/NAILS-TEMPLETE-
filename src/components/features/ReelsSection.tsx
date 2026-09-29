
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Heart, MessageCircle, Share2, Play, Pause, Volume2, VolumeX, ChevronLeft, ChevronRight, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface Reel {
  id: string;
  title: string;
  description: string | null;
  video_url: string;
  thumbnail_url: string | null;
  category: string | null;
  likes_count: number;
  comments_count: number;
  views_count: number;
  is_active: boolean;
  created_at: string;
}

interface Comment {
  id: string;
  reel_id: string;
  customer_name: string;
  comment_text: string;
  is_approved: boolean;
  created_at: string;
}

export function ReelsSection() {
  const [reels, setReels] = useState<Reel[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentReelIndex, setCurrentReelIndex] = useState(0);
  const scrollContainer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchReels();
  }, []);

  const fetchReels = async () => {
    try {
      const { data, error } = await supabase
        .from('service_reels')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setReels(data || []);
    } catch (error) {
      console.error('Error fetching reels:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-20 bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
      </section>
    );
  }

  const handleScroll = (direction: 'left' | 'right') => {
    if (!scrollContainer.current) return;
    const scrollAmount = 400; // Width of one reel card + gap
    const newScrollLeft = direction === 'left'
      ? scrollContainer.current.scrollLeft - scrollAmount
      : scrollContainer.current.scrollLeft + scrollAmount;
    
    scrollContainer.current.scrollTo({
      left: newScrollLeft,
      behavior: 'smooth',
    });
  };

  return (
    <section className="py-20 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Our Work in{' '}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Action
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Watch our latest transformations, nail art tutorials, and customer makeovers
          </p>
        </div>

        {/* Reels Carousel */}
        <div className="relative">
          {reels.length === 0 ? (
            /* Empty State */
            <div className="glass-card p-12 rounded-2xl text-center max-w-md mx-auto">
              <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Video className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Coming Soon!</h3>
              <p className="text-muted-foreground">
                We're uploading amazing transformation videos, nail art tutorials, and customer makeovers. Check back soon!
              </p>
            </div>
          ) : (
            <>
              {/* Navigation Arrows */}
              <button
                onClick={() => handleScroll('left')}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white rounded-full p-3 shadow-lg transition-all hover:scale-110 -ml-4"
                aria-label="Scroll left"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={() => handleScroll('right')}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white rounded-full p-3 shadow-lg transition-all hover:scale-110 -mr-4"
                aria-label="Scroll right"
              >
                <ChevronRight className="w-6 h-6" />
              </button>

              {/* Horizontal Scrollable Container */}
              <div
                ref={scrollContainer}
                className="flex gap-6 overflow-x-auto scroll-smooth pb-4 scrollbar-hide"
                style={{
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none',
                }}
              >
                {reels.map((reel) => (
                  <div
                    key={reel.id}
                    className="flex-shrink-0 w-[350px]"
                  >
                    <ReelCard reel={reel} isActive={true} />
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}


// Individual Reel Card Component
function ReelCard({ reel, isActive }: { reel: Reel; isActive: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(reel.likes_count);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState({ name: '', text: '' });
  const [sessionId, setSessionId] = useState('');

  useEffect(() => {
    // Generate or retrieve session ID
    let sid = localStorage.getItem('user_session_id');
    if (!sid) {
      sid = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('user_session_id', sid);
    }
    setSessionId(sid);

    // Check if already liked
    checkIfLiked(sid);

    // Fetch comments
    if (showComments) {
      fetchComments();
    }
  }, [showComments, reel.id]); // Added reel.id to dependency array for fetchComments and checkIfLiked when showComments changes

  useEffect(() => {
    if (isActive && videoRef.current) {
      videoRef.current.play();
      setIsPlaying(true);
    } else if (videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  }, [isActive]);

  const checkIfLiked = async (sid: string) => {
    try {
      const { data, error } = await supabase
        .from('reel_likes')
        .select('id')
        .eq('reel_id', reel.id)
        .eq('user_session_id', sid)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      setIsLiked(!!data);
    } catch (error) {
      console.error('Error checking like:', error);
    }
  };

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from('reel_comments')
        .select('*')
        .eq('reel_id', reel.id)
        .eq('is_approved', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setComments(data || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleLike = async () => {
    try {
      if (isLiked) {
        // Unlike
        const { error } = await supabase
          .from('reel_likes')
          .delete()
          .eq('reel_id', reel.id)
          .eq('user_session_id', sessionId);

        if (error) throw error;
        setIsLiked(false);
        setLikesCount((prev) => prev - 1);
      } else {
        // Like
        const { error } = await supabase
          .from('reel_likes')
          .insert({
            reel_id: reel.id,
            user_session_id: sessionId,
          });

        if (error) throw error;
        setIsLiked(true);
        setLikesCount((prev) => prev + 1);
      }
    } catch (error: any) {
      console.error('Error toggling like:', error);
      toast.error('Failed to update like');
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newComment.name || !newComment.text) {
      toast.error('Please fill all fields');
      return;
    }

    try {
      const { error } = await supabase
        .from('reel_comments')
        .insert({
          reel_id: reel.id,
          customer_name: newComment.name,
          comment_text: newComment.text,
        });

      if (error) throw error;

      toast.success('Comment submitted! It will appear after approval.');
      setNewComment({ name: '', text: '' });
    } catch (error: any) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    }
  };

  const handleShare = async () => {
    const shareUrl = window.location.href;
    
    // Try native share first (mobile-friendly)
    if (navigator.share) {
      try {
        await navigator.share({
          title: reel.title,
          text: reel.description || reel.title,
          url: shareUrl,
        });
        return; // Share successful, exit
      } catch (error: any) {
        // Share failed/cancelled - fall through to clipboard
        if (error.name !== 'AbortError') {
          console.log('Share cancelled or unavailable, using clipboard instead');
        }
      }
    }
    
    // Fallback: copy to clipboard (desktop-friendly)
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Link copied to clipboard!');
    } catch (error) {
      console.error('Clipboard error:', error);
      toast.error('Unable to share. Please copy the URL manually.');
    }
  };

  return (
    <div className="glass-card rounded-2xl overflow-hidden group relative">
      {/* Video Player */}
      <div className="relative aspect-[9/16] bg-black">
        <video
          ref={videoRef}
          src={reel.video_url}
          poster={reel.thumbnail_url || undefined}
          loop
          muted={isMuted}
          playsInline
          className="w-full h-full object-cover"
          onClick={togglePlay}
        />

        {/* Play/Pause Overlay */}
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <button
              onClick={togglePlay}
              className="w-20 h-20 rounded-full bg-white/90 flex items-center justify-center hover:bg-white transition-all hover:scale-110"
            >
              <Play className="w-10 h-10 text-primary ml-1" />
            </button>
          </div>
        )}

        {/* Mute/Unmute Button */}
        <button
          onClick={toggleMute}
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-all"
        >
          {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </button>

        {/* Video Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
          <h3 className="text-white font-semibold text-lg mb-1">{reel.title}</h3>
          {reel.description && (
            <p className="text-white/80 text-sm line-clamp-2">{reel.description}</p>
          )}
        </div>
      </div>

      {/* Interaction Buttons */}
      <div className="p-4 bg-background">
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={handleLike}
            className={`flex items-center gap-2 transition-all hover:scale-110 ${
              isLiked ? 'text-red-500' : 'text-muted-foreground hover:text-red-500'
            }`}
          >
            <Heart className={`w-6 h-6 ${isLiked ? 'fill-current' : ''}`} />
            <span className="font-semibold">{likesCount}</span>
          </button>

          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-all hover:scale-110"
          >
            <MessageCircle className="w-6 h-6" />
            <span className="font-semibold">{reel.comments_count}</span>
          </button>

          <button
            onClick={handleShare}
            className="flex items-center gap-2 text-muted-foreground hover:text-accent transition-all hover:scale-110"
          >
            <Share2 className="w-6 h-6" />
          </button>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="mt-4 pt-4 border-t">
            {/* Comment Form */}
            <form onSubmit={handleComment} className="mb-4">
              <Input
                placeholder="Your Name"
                value={newComment.name}
                onChange={(e) => setNewComment({ ...newComment, name: e.target.value })}
                className="mb-2"
              />
              <Input
                placeholder="Add a comment..."
                value={newComment.text}
                onChange={(e) => setNewComment({ ...newComment, text: e.target.value })}
                className="mb-2"
              />
              <Button type="submit" size="sm" className="w-full">
                Post Comment
              </Button>
            </form>

            {/* Comments List */}
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {comments.map((comment) => (
                <div key={comment.id} className="text-sm">
                  <p className="font-semibold text-foreground">{comment.customer_name}</p>
                  <p className="text-muted-foreground">{comment.comment_text}</p>
                </div>
              ))}
              {comments.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No comments yet. Be the first to comment!
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
