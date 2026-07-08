import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { SEO } from '../components/SEO';
import { SharePostButton } from '../components/feed/SharePostButton';
import { useTimeline } from '../hooks/useFeed';
import { useAllCreatorPools } from '../hooks/useShares';
import {
  Sparkles,
  TrendingUp,
  Lock,
  Search,
  ArrowRight,
  Flame,
  Heart,
  MessageCircle,
} from 'lucide-react';
import { PostSkeleton } from '../components/LoadingStates';
import { PAGE_SEO_CONFIG } from '../lib/seo/page-config';
import { getNetworkLabel } from '../utils/constants';
import { buildExplorePageSchema } from '../lib/seo/schema';
import { Input, Card, MotionCard, getButtonClassName } from '../design-system';

const EXPLORE_FILTERS = [
  { id: 'trending', label: 'Trending', icon: <TrendingUp className="w-4 h-4" /> },
  { id: 'new', label: 'New', icon: <Sparkles className="w-4 h-4" /> },
  { id: 'supporters', label: 'Supporters only', icon: <Lock className="w-4 h-4" /> },
] as const;

export function Explore() {
  const { data: timelinePosts = [], isPending, isError } = useTimeline();
  const { data: creatorPools = [] } = useAllCreatorPools();
  const [activeFilter, setActiveFilter] = useState<(typeof EXPLORE_FILTERS)[number]['id']>('trending');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    setIsSearching(true);
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
      setIsSearching(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const explorePosts = useMemo(() => {
    return timelinePosts.map((post) => {
      const content = post.content || '';
      const firstLine = content.split('\n')[0].slice(0, 80);
      const accessLevel = post.accessLevel || (post.isSubscriberOnly ? 'supporters' : 'public');

      const hoursAgo = Math.floor((Date.now() - post.createdAt) / 3600000);
      const time =
        hoursAgo < 1 ? 'just now' : hoursAgo < 24 ? `${hoursAgo}h ago` : `${Math.floor(hoursAgo / 24)}d ago`;

      return {
        id: post.id,
        title:
          accessLevel === 'supporters'
            ? 'Supporters-only post'
            : firstLine || 'On-chain post',
        excerpt:
          accessLevel === 'supporters'
            ? 'Buy Supporter Shares to unlock this content.'
            : content.slice(0, 120),
        author: post.author,
        authorUsername: post.authorUsername,
        authorShort: post.authorUsername || post.author.slice(0, 8),
        authorPath: post.authorUsername || post.author,
        likes: post.likes,
        comments: post.comments,
        image: post.imageUrls[0] || undefined,
        accessLevel,
        time,
        createdAt: post.createdAt,
      };
    });
  }, [timelinePosts]);

  const filteredPosts = useMemo(() => {
    let posts = [...explorePosts];

    if (activeFilter === 'trending') {
      posts.sort((a, b) => b.likes - a.likes || b.createdAt - a.createdAt);
    } else if (activeFilter === 'new') {
      posts.sort((a, b) => b.createdAt - a.createdAt);
    } else if (activeFilter === 'supporters') {
      posts = posts.filter((p) => p.accessLevel === 'supporters');
    }

    if (!debouncedQuery) return posts;
    const query = debouncedQuery.toLowerCase();
    return posts.filter(
      (post) =>
        post.author.toLowerCase().includes(query) ||
        (post.authorUsername?.toLowerCase().includes(query) ?? false) ||
        post.title.toLowerCase().includes(query) ||
        post.excerpt.toLowerCase().includes(query),
    );
  }, [explorePosts, activeFilter, debouncedQuery]);

  const exploreConfig = PAGE_SEO_CONFIG['/explore'];

  const schemaItems = filteredPosts.slice(0, 20).map((post) => ({
    id: post.id,
    name: post.title,
    path: `/post/${post.id}`,
  }));

  const schema = buildExplorePageSchema(exploreConfig.breadcrumbs ?? [], schemaItems);

  return (
    <AppLayout>
      <SEO
        title={exploreConfig.title}
        description={exploreConfig.description}
        keywords={exploreConfig.keywords}
        image={exploreConfig.ogImage}
        imageAlt="Explore creators on Pulse Social"
        url="/explore"
        schema={schema}
      />

      <div className="max-w-[1400px] mx-auto pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative mb-12 text-center"
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-primary/10 blur-[100px] rounded-full pointer-events-none" />

          <h1 className="text-display mb-6 relative z-10">
            Discover{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-[var(--gradient-green-end)]">
              creators
            </span>
          </h1>
          <p className="text-body text-muted max-w-2xl mx-auto relative z-10">
            Find creators with active Supporter Shares pools. Support them to unlock exclusive content.
          </p>
          {creatorPools.length > 0 && (
            <p className="text-sm text-muted mt-4 relative z-10">
              {creatorPools.length} creator{creatorPools.length !== 1 ? 's' : ''} with Supporter Shares on {getNetworkLabel()}
            </p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12 max-w-3xl mx-auto relative z-20"
        >
          <div className="relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-muted group-hover:text-primary transition-colors z-10" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search creators or posts..."
              className="h-auto pl-16 pr-12 py-5 rounded-ds-xl text-lg shadow-xl"
            />
            {isSearching && (
              <div className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap justify-center gap-3 mb-12"
        >
          {EXPLORE_FILTERS.map((filter) => (
            <motion.button
              key={filter.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveFilter(filter.id)}
              className={getButtonClassName(
                activeFilter === filter.id ? 'primary' : 'secondary',
                'sm',
              )}
            >
              {filter.icon}
              <span>{filter.label}</span>
            </motion.button>
          ))}
        </motion.div>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold flex items-center gap-3">
              {activeFilter === 'trending' ? (
                <Flame className="w-8 h-8 text-warning" />
              ) : activeFilter === 'supporters' ? (
                <Lock className="w-8 h-8 text-primary" />
              ) : (
                <Sparkles className="w-8 h-8 text-info" />
              )}
              {EXPLORE_FILTERS.find((f) => f.id === activeFilter)?.label}
            </h2>
            {debouncedQuery && (
              <div className="text-muted bg-surface-2 px-4 py-2 rounded-xl border border-border">
                Found <span className="text-foreground font-bold">{filteredPosts.length}</span> results
              </div>
            )}
          </div>

          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence mode="popLayout">
              {isPending ? (
                <div className="col-span-full space-y-4">
                  {[1, 2, 3].map((i) => (
                    <PostSkeleton key={i} />
                  ))}
                </div>
              ) : isError ? (
                <Card variant="glass" className="col-span-full py-20 text-center rounded-[3rem] border border-border">
                  <h3 className="text-2xl font-bold mb-2">Failed to load posts</h3>
                  <p className="text-muted">Check your connection and try again.</p>
                </Card>
              ) : filteredPosts.length > 0 ? (
                filteredPosts.map((post, index) => (
                  <MotionCard
                    variant="glass"
                    layout
                    key={post.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="rounded-[2rem] overflow-hidden border border-border hover:border-primary/30 transition-all group flex flex-col h-full"
                  >
                    <div className="relative h-48 overflow-hidden bg-gradient-to-br from-surface-2 to-background">
                      {post.accessLevel === 'supporters' ? (
                        <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-background/80 backdrop-blur-md">
                          <Lock className="w-8 h-8 text-primary" />
                          <span className="text-xs font-bold text-muted uppercase tracking-wider">
                            Supporters only
                          </span>
                        </div>
                      ) : post.image ? (
                        <img
                          src={post.image}
                          alt=""
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted text-sm">
                          No media
                        </div>
                      )}
                      {post.accessLevel === 'supporters' && (
                        <div className="absolute top-4 right-4 bg-background/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold border border-primary/30 text-primary flex items-center gap-1">
                          <Lock className="w-3 h-3" />
                          Supporters
                        </div>
                      )}
                    </div>

                    <div className="p-6 flex flex-col flex-1">
                      <div className="flex items-center gap-3 mb-4">
                        <img
                          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author}`}
                          alt=""
                          className="w-10 h-10 rounded-full bg-background border border-border"
                        />
                        <div>
                          <Link
                            to={`/${post.authorPath}`}
                            className="text-sm font-bold text-foreground hover:text-primary"
                          >
                            @{post.authorShort}
                          </Link>
                          <div className="text-xs text-muted">{post.time}</div>
                        </div>
                      </div>

                      <h3 className="text-lg font-bold mb-2 text-foreground line-clamp-2">{post.title}</h3>
                      <p className="text-muted text-sm mb-4 line-clamp-2 flex-1">{post.excerpt}</p>

                      <div className="flex items-center justify-between pt-4 border-t border-border">
                        <div className="flex items-center gap-4 text-muted">
                          <span className="flex items-center gap-1 text-xs">
                            <Heart className="w-4 h-4" />
                            {post.likes}
                          </span>
                          <span className="flex items-center gap-1 text-xs">
                            <MessageCircle className="w-4 h-4" />
                            {post.comments}
                          </span>
                          <SharePostButton
                            postId={post.id}
                            title={post.title}
                            text={post.excerpt}
                          />
                        </div>
                        <Link
                          to={`/post/${post.id}`}
                          className="w-10 h-10 rounded-full bg-surface-2 hover:bg-primary hover:text-background flex items-center justify-center transition-all"
                          aria-label="View post"
                        >
                          <ArrowRight className="w-5 h-5" />
                        </Link>
                      </div>
                    </div>
                  </MotionCard>
                ))
              ) : (
                <Card variant="glass" className="col-span-full py-20 text-center rounded-[3rem] border border-border border-dashed">
                  <Search className="w-10 h-10 text-muted mx-auto mb-4" />
                  <h3 className="text-2xl font-bold mb-2">No posts found</h3>
                  <p className="text-muted">
                    {debouncedQuery
                      ? 'No posts match your search. Try different keywords.'
                      : activeFilter === 'supporters'
                        ? 'No supporters-only posts yet. Check back later!'
                        : 'No posts yet. Be the first to share something!'}
                  </p>
                </Card>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </AppLayout>
  );
}
