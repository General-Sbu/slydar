import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ThumbsUp, Heart, ThumbsDown } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { Reaction, ReactionType } from "@shared/schema";

interface SlideReactionsProps {
  slideId: string;
  sessionId: string;
  participantId: string;
  reactions: Reaction[];
  onReact: (reactionType: ReactionType) => void;
}

export default function SlideReactions({
  slideId,
  sessionId,
  participantId,
  reactions,
  onReact,
}: SlideReactionsProps) {
  const [activeReaction, setActiveReaction] = useState<ReactionType | null>(null);

  useEffect(() => {
    const userReaction = reactions.find(
      (r) => r.participantId === participantId && r.slideId === slideId && r.sessionId === sessionId
    );
    setActiveReaction(userReaction?.reactionType as ReactionType || null);
  }, [reactions, participantId, slideId, sessionId]);

  const reactionCounts = reactions.reduce((acc, reaction) => {
    acc[reaction.reactionType] = (acc[reaction.reactionType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const handleReaction = (reactionType: ReactionType) => {
    onReact(reactionType);
  };

  const reactionButtons = [
    {
      type: "like" as ReactionType,
      icon: ThumbsUp,
      label: "Like",
      activeClass: "bg-blue-500/20 border-blue-500 text-blue-600 dark:text-blue-400",
    },
    {
      type: "heart" as ReactionType,
      icon: Heart,
      label: "Love",
      activeClass: "bg-red-500/20 border-red-500 text-red-600 dark:text-red-400",
    },
    {
      type: "thumbs_down" as ReactionType,
      icon: ThumbsDown,
      label: "Dislike",
      activeClass: "bg-orange-500/20 border-orange-500 text-orange-600 dark:text-orange-400",
    },
  ];

  return (
    <div className="flex items-center justify-center gap-3">
      {reactionButtons.map(({ type, icon: Icon, label, activeClass }) => {
        const count = reactionCounts[type] || 0;
        const isActive = activeReaction === type;

        return (
          <motion.div
            key={type}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              variant="outline"
              size="default"
              onClick={() => handleReaction(type)}
              className={cn(
                "relative gap-2 transition-all duration-200",
                isActive && activeClass
              )}
              data-testid={`button-reaction-${type}`}
            >
              <motion.div
                animate={isActive ? { scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 0.3 }}
              >
                <Icon className="h-5 w-5" />
              </motion.div>
              <span className="font-medium">{label}</span>
              {count > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-2 -right-2 h-5 min-w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center px-1"
                  data-testid={`text-reaction-count-${type}`}
                >
                  {count}
                </motion.span>
              )}
            </Button>
          </motion.div>
        );
      })}
    </div>
  );
}
