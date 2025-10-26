import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface FloatingEmoji {
  id: string;
  emoji: string;
  x: number;
}

interface FloatingEmojisProps {
  emojis: FloatingEmoji[];
}

export default function FloatingEmojis({ emojis }: FloatingEmojisProps) {
  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      <AnimatePresence>
        {emojis.map((item) => (
          <motion.div
            key={item.id}
            initial={{ 
              y: "100vh", 
              x: `${item.x}%`,
              opacity: 0,
              scale: 0
            }}
            animate={{ 
              y: "-20vh", 
              opacity: [0, 1, 1, 0],
              scale: [0, 1.2, 1, 0.8],
              rotate: [0, 10, -10, 0]
            }}
            exit={{ opacity: 0 }}
            transition={{ 
              duration: 3,
              ease: "easeOut"
            }}
            className="absolute text-4xl"
            style={{ left: 0 }}
          >
            {item.emoji}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

interface EmojiSelectorProps {
  onEmojiSelect: (emoji: string) => void;
  className?: string;
}

export function EmojiSelector({ onEmojiSelect, className = "" }: EmojiSelectorProps) {
  const emojis = ["👏", "🔥", "❤️", "😂", "👍", "🎉"];
  
  return (
    <div className={`flex gap-2 ${className}`}>
      {emojis.map((emoji) => (
        <button
          key={emoji}
          onClick={() => onEmojiSelect(emoji)}
          className="text-3xl hover-elevate active-elevate-2 p-2 rounded-lg transition-all"
          data-testid={`button-emoji-${emoji}`}
          aria-label={`React with ${emoji}`}
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}
