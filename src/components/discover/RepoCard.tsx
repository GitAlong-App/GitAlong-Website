import React, { useRef, useState } from 'react';
import { animate, motion, PanInfo, useMotionValue, useTransform } from 'framer-motion';
import { Bookmark, ExternalLink, GitFork, Star, X } from 'lucide-react';
import type { Repository } from '../../services/githubService';
import { EASE_OUT_CUBIC, useMediaQuery, usePrefersReducedMotion } from '../../lib/motion';
import { Avatar, Chip, CircleActionButton, PressableLink } from '../ui';

/**
 * Trending-repository card (the fallback when the matching service is
 * unavailable or has no candidates). Right = save, left = skip, up = open.
 */
interface RepoCardProps {
  repo: Repository;
  onSwipeLeft: (repo: Repository) => void;
  onSwipeRight: (repo: Repository) => void;
  onSwipeUp: (repo: Repository) => void;
  hasNext: boolean;
}

export const RepoCard: React.FC<RepoCardProps> = ({ repo, onSwipeLeft, onSwipeRight, onSwipeUp, hasNext }) => {
  const reduced = usePrefersReducedMotion();
  const roomy = useMediaQuery('(min-width: 640px)');
  const [leaving, setLeaving] = useState(false);
  const leavingRef = useRef(false);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const opacity = useMotionValue(1);
  const rotate = useTransform(x, [-320, 0, 320], [-12, 0, 12]);
  const saveOpacity = useTransform(x, [24, 110], [0, 1]);
  const skipOpacity = useTransform(x, [-110, -24], [1, 0]);

  const leave = async (dir: 'left' | 'right' | 'up', done: (r: Repository) => void) => {
    if (leavingRef.current) return;
    leavingRef.current = true;
    setLeaving(true);
    if (reduced) await animate(opacity, 0, { duration: 0.15 });
    else if (dir === 'up') await animate(y, -Math.max(720, window.innerHeight), { duration: 0.35, ease: [0.4, 0, 0.2, 1] });
    else await animate(x, (dir === 'right' ? 1 : -1) * (window.innerWidth / 2 + 520), { duration: 0.3, ease: [0.4, 0, 0.2, 1] });
    done(repo);
  };

  const onDragEnd = (_e: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (Math.abs(info.offset.y) > Math.abs(info.offset.x) && info.offset.y < -120) void leave('up', onSwipeUp);
    else if (info.offset.x > 120 || info.velocity.x > 650) void leave('right', onSwipeRight);
    else if (info.offset.x < -120 || info.velocity.x < -650) void leave('left', onSwipeLeft);
  };

  const owner = repo.owner?.login || repo.full_name.split('/')[0];

  return (
    <div className="relative mx-auto w-full max-w-[460px]">
      <div className="relative">
        {hasNext && (
          <div aria-hidden className="absolute inset-x-5 -bottom-2.5 top-3 rounded-xl border-2 border-border bg-card shadow-edge-tile" />
        )}
        <motion.article
          aria-label={`${repo.full_name}, ${repo.stargazers_count.toLocaleString()} stars`}
          drag={leaving ? false : true}
          dragSnapToOrigin
          onDragEnd={onDragEnd}
          style={{ x, y, rotate, opacity }}
          initial={reduced ? { opacity: 0 } : { scale: 0.96, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: EASE_OUT_CUBIC }}
          whileDrag={{ scale: 1.02, cursor: 'grabbing' }}
          className="relative cursor-grab touch-none select-none overflow-hidden rounded-xl border-2 border-border bg-card shadow-edge-tile"
        >
          <motion.span
            aria-hidden
            style={{ opacity: saveOpacity, rotate: -12 }}
            className="pointer-events-none absolute left-5 top-6 z-20 rounded-md border-4 border-green bg-card/90 px-3 py-1 text-[28px] font-black uppercase leading-none tracking-[2px] text-green-fg"
          >
            Save
          </motion.span>
          <motion.span
            aria-hidden
            style={{ opacity: skipOpacity, rotate: 12 }}
            className="pointer-events-none absolute right-5 top-6 z-20 rounded-md border-4 border-danger bg-card/90 px-3 py-1 text-[28px] font-black uppercase leading-none tracking-[2px] text-danger-fg"
          >
            Skip
          </motion.span>

          <div className="bg-gradient-to-b from-sky-tint/70 to-transparent px-5 pb-3 pt-5">
            <div className="flex items-center gap-3">
              <Avatar src={repo.owner?.avatar_url} name={owner} size={56} className="rounded-md border-2 border-card" />
              <div className="min-w-0">
                <h2 className="truncate text-h2 text-ink">{repo.name}</h2>
                <p className="truncate text-body-sm text-ink-muted">{owner}</p>
              </div>
            </div>
          </div>
          <div className="space-y-4 px-5 pb-5">
            <p className="line-clamp-4 text-body text-ink">{repo.description || 'No description yet.'}</p>
            <div className="flex flex-wrap items-center gap-2">
              <Chip size="sm" tone="gold" icon={<Star className="h-3 w-3 fill-current" aria-hidden />}>
                {repo.stargazers_count.toLocaleString()} stars
              </Chip>
              <Chip size="sm" icon={<GitFork className="h-3 w-3" aria-hidden />}>
                {repo.forks_count.toLocaleString()} forks
              </Chip>
              {repo.language && (
                <Chip size="sm" tone="sky">
                  {repo.language}
                </Chip>
              )}
            </div>
            <PressableLink
              href={repo.html_url}
              target="_blank"
              rel="noopener noreferrer"
              variant="secondary"
              size="sm"
              fullWidth
              leadingIcon={<ExternalLink strokeWidth={2.5} />}
              onPointerDownCapture={(e) => e.stopPropagation()}
            >
              View repository
            </PressableLink>
          </div>
        </motion.article>
      </div>

      <div className="sticky bottom-[calc(80px+env(safe-area-inset-bottom))] z-20 mt-6 md:bottom-4">
        <div className="mx-auto flex w-max items-center justify-center gap-7 rounded-[40px] border-2 border-border bg-bg/85 px-5 py-1.5 shadow-edge-tile backdrop-blur-md sm:items-end sm:px-6 sm:pb-1 sm:pt-2.5">
          <CircleActionButton
            variant="danger"
            label="Skip"
            size={roomy ? 64 : 56}
            captionClassName="hidden sm:block"
            icon={<X className="h-8 w-8" strokeWidth={3.5} />}
            onClick={() => void leave('left', onSwipeLeft)}
            disabled={leaving}
          />
          <CircleActionButton
            variant="green"
            label="Save"
            size={roomy ? 72 : 64}
            captionClassName="hidden sm:block"
            icon={<Bookmark className="h-8 w-8 fill-white" strokeWidth={2.5} />}
            onClick={() => void leave('right', onSwipeRight)}
            disabled={leaving}
          />
        </div>
      </div>
    </div>
  );
};
