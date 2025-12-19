import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

interface SlideTypeCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  onClick?: () => void;
}

export default function SlideTypeCard({ icon: Icon, title, description, onClick }: SlideTypeCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      <Card 
        className="cursor-pointer hover-elevate active-elevate-2 transition-all duration-200"
        onClick={onClick}
        data-testid={`card-slide-type-${title.toLowerCase().replace(/\s+/g, '-')}`}
      >
        <CardHeader className="space-y-2">
          <motion.div 
            className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center"
            whileHover={{ rotate: [0, -10, 10, 0] }}
            transition={{ duration: 0.4 }}
          >
            <Icon className="h-5 w-5 text-primary" />
          </motion.div>
          <CardTitle className="text-base">{title}</CardTitle>
          <CardDescription className="text-sm">{description}</CardDescription>
        </CardHeader>
      </Card>
    </motion.div>
  );
}
