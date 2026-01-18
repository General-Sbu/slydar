import { storage } from "./storage";
import type { InsertTemplate, TemplateSlide } from "@shared/schema";

const quickOpinionPollSlides: TemplateSlide[] = [
  {
    type: "heading",
    title: "Quick Opinion Poll",
    config: { elements: [{ type: "text", id: "title", content: "Quick Opinion Poll", x: 10, y: 35, width: 80, fontSize: 52, fontWeight: "bold", textAlign: "center", zIndex: 1 }, { type: "text", id: "subtitle", content: "Share your thoughts with us!", x: 10, y: 55, width: 80, fontSize: 24, fontWeight: "normal", textAlign: "center", zIndex: 2 }] }
  },
  {
    type: "multiple_choice",
    question: "How do you prefer to receive updates?",
    options: ["Email", "Text Message", "Mobile App", "Social Media"],
    config: { elements: [] }
  },
  {
    type: "multiple_choice",
    question: "What time of day works best for meetings?",
    options: ["Early Morning (8-10 AM)", "Late Morning (10-12 PM)", "Afternoon (1-3 PM)", "Late Afternoon (3-5 PM)"],
    config: { elements: [] }
  },
  {
    type: "word_cloud",
    question: "In one word, what matters most to you?",
    config: { elements: [] }
  }
];

const decisionMakingPollSlides: TemplateSlide[] = [
  {
    type: "heading",
    title: "Let's Decide Together",
    config: { elements: [{ type: "text", id: "title", content: "Let's Decide Together", x: 10, y: 35, width: 80, fontSize: 48, fontWeight: "bold", textAlign: "center", zIndex: 1 }, { type: "text", id: "subtitle", content: "Your vote counts!", x: 10, y: 55, width: 80, fontSize: 24, fontWeight: "normal", textAlign: "center", zIndex: 2 }] }
  },
  {
    type: "multiple_choice",
    question: "Which option should we go with?",
    options: ["Option A - Safe Choice", "Option B - Bold Move", "Option C - Middle Ground", "Need More Information"],
    config: { elements: [] }
  },
  {
    type: "multiple_choice",
    question: "How confident are you in this decision?",
    options: ["Very Confident", "Somewhat Confident", "Neutral", "Need Discussion"],
    config: { elements: [] }
  },
  {
    type: "multiple_choice",
    question: "When should we implement this?",
    options: ["Immediately", "This Week", "This Month", "Next Quarter"],
    config: { elements: [] }
  }
];

const triviaQuizSlides: TemplateSlide[] = [
  {
    type: "heading",
    title: "Trivia Time!",
    config: { elements: [{ type: "text", id: "title", content: "Trivia Time!", x: 10, y: 30, width: 80, fontSize: 56, fontWeight: "bold", textAlign: "center", zIndex: 1 }, { type: "text", id: "subtitle", content: "Test your knowledge and have fun!", x: 10, y: 52, width: 80, fontSize: 24, fontWeight: "normal", textAlign: "center", zIndex: 2 }] }
  },
  {
    type: "multiple_choice",
    question: "Which planet is known as the Red Planet?",
    options: ["Venus", "Mars", "Jupiter", "Saturn"],
    config: { elements: [] }
  },
  {
    type: "multiple_choice",
    question: "What is the capital city of Australia?",
    options: ["Sydney", "Melbourne", "Canberra", "Brisbane"],
    config: { elements: [] }
  },
  {
    type: "multiple_choice",
    question: "How many continents are there on Earth?",
    options: ["5", "6", "7", "8"],
    config: { elements: [] }
  },
  {
    type: "multiple_choice",
    question: "Which element has the chemical symbol 'O'?",
    options: ["Gold", "Osmium", "Oxygen", "Iron"],
    config: { elements: [] }
  }
];

const trainingQuizSlides: TemplateSlide[] = [
  {
    type: "heading",
    title: "Training Assessment",
    config: { elements: [{ type: "text", id: "title", content: "Training Assessment", x: 10, y: 30, width: 80, fontSize: 52, fontWeight: "bold", textAlign: "center", zIndex: 1 }, { type: "text", id: "subtitle", content: "Let's check what you've learned!", x: 10, y: 52, width: 80, fontSize: 24, fontWeight: "normal", textAlign: "center", zIndex: 2 }] }
  },
  {
    type: "word_cloud",
    question: "What key concepts do you remember from the training?",
    config: { elements: [] }
  },
  {
    type: "multiple_choice",
    question: "Which step comes first in the process?",
    options: ["Planning", "Execution", "Review", "Documentation"],
    config: { elements: [] }
  },
  {
    type: "multiple_choice",
    question: "True or False: Regular practice improves retention",
    options: ["True", "False"],
    config: { elements: [] }
  },
  {
    type: "multiple_choice",
    question: "What is the best approach when facing challenges?",
    options: ["Ask for help immediately", "Try multiple solutions", "Give up quickly", "Ignore the problem"],
    config: { elements: [] }
  }
];

const eventFeedbackSlides: TemplateSlide[] = [
  {
    type: "heading",
    title: "Event Feedback",
    config: { elements: [{ type: "text", id: "title", content: "Event Feedback", x: 10, y: 30, width: 80, fontSize: 52, fontWeight: "bold", textAlign: "center", zIndex: 1 }, { type: "text", id: "subtitle", content: "Help us improve future events!", x: 10, y: 52, width: 80, fontSize: 24, fontWeight: "normal", textAlign: "center", zIndex: 2 }] }
  },
  {
    type: "multiple_choice",
    question: "How would you rate this event overall?",
    options: ["Excellent", "Very Good", "Good", "Needs Improvement"],
    config: { elements: [] }
  },
  {
    type: "multiple_choice",
    question: "Was the event duration appropriate?",
    options: ["Too Short", "Just Right", "Slightly Long", "Too Long"],
    config: { elements: [] }
  },
  {
    type: "word_cloud",
    question: "What was the highlight of the event?",
    config: { elements: [] }
  },
  {
    type: "multiple_choice",
    question: "Would you attend a similar event in the future?",
    options: ["Definitely Yes", "Probably Yes", "Maybe", "Probably Not"],
    config: { elements: [] }
  }
];

const productFeedbackSlides: TemplateSlide[] = [
  {
    type: "heading",
    title: "Product Feedback",
    config: { elements: [{ type: "text", id: "title", content: "Product Feedback", x: 10, y: 30, width: 80, fontSize: 52, fontWeight: "bold", textAlign: "center", zIndex: 1 }, { type: "text", id: "subtitle", content: "Your opinion shapes our future!", x: 10, y: 52, width: 80, fontSize: 24, fontWeight: "normal", textAlign: "center", zIndex: 2 }] }
  },
  {
    type: "multiple_choice",
    question: "How satisfied are you with the product?",
    options: ["Very Satisfied", "Satisfied", "Neutral", "Dissatisfied"],
    config: { elements: [] }
  },
  {
    type: "multiple_choice",
    question: "How likely are you to recommend this to others?",
    options: ["Very Likely", "Likely", "Unlikely", "Very Unlikely"],
    config: { elements: [] }
  },
  {
    type: "word_cloud",
    question: "What feature do you use the most?",
    config: { elements: [] }
  },
  {
    type: "multiple_choice",
    question: "What would you most like us to improve?",
    options: ["Performance", "Design", "Features", "Pricing"],
    config: { elements: [] }
  }
];

const teamIntroductionSlides: TemplateSlide[] = [
  {
    type: "heading",
    title: "Meet the Team!",
    config: { elements: [{ type: "text", id: "title", content: "Meet the Team!", x: 10, y: 30, width: 80, fontSize: 56, fontWeight: "bold", textAlign: "center", zIndex: 1 }, { type: "text", id: "subtitle", content: "Let's get to know each other", x: 10, y: 52, width: 80, fontSize: 24, fontWeight: "normal", textAlign: "center", zIndex: 2 }] }
  },
  {
    type: "word_cloud",
    question: "Where are you joining from today?",
    config: { elements: [] }
  },
  {
    type: "multiple_choice",
    question: "What's your role in the team?",
    options: ["Engineering", "Design", "Product", "Operations", "Other"],
    config: { elements: [] }
  },
  {
    type: "spinner",
    question: "Spin to share something about yourself!",
    config: { 
      elements: [],
      spinnerEntries: [
        { id: "1", label: "Your name & role", color: "#9333EA" },
        { id: "2", label: "A fun fact", color: "#DC2626" },
        { id: "3", label: "Your superpower", color: "#EA580C" },
        { id: "4", label: "Weekend plans", color: "#EAB308" },
        { id: "5", label: "Favorite book/show", color: "#22C55E" },
        { id: "6", label: "Dream destination", color: "#14B8A6" },
        { id: "7", label: "Hidden talent", color: "#3B82F6" },
        { id: "8", label: "Best advice received", color: "#1E3A8A" }
      ]
    }
  },
  {
    type: "word_cloud",
    question: "What are you most excited to work on?",
    config: { elements: [] }
  }
];

const funIcebreakerSlides: TemplateSlide[] = [
  {
    type: "heading",
    title: "Let's Break the Ice!",
    config: { elements: [{ type: "text", id: "title", content: "Let's Break the Ice!", x: 10, y: 30, width: 80, fontSize: 52, fontWeight: "bold", textAlign: "center", zIndex: 1 }, { type: "text", id: "subtitle", content: "Time for some fun!", x: 10, y: 52, width: 80, fontSize: 28, fontWeight: "normal", textAlign: "center", zIndex: 2 }] }
  },
  {
    type: "multiple_choice",
    question: "How are you feeling right now?",
    options: ["Energized", "Relaxed", "Curious", "Ready to Go!"],
    config: { elements: [] }
  },
  {
    type: "multiple_choice",
    question: "If you could have any superpower, what would it be?",
    options: ["Flying", "Invisibility", "Time Travel", "Mind Reading"],
    config: { elements: [] }
  },
  {
    type: "spinner",
    question: "Spin the wheel for a fun question!",
    config: { 
      elements: [],
      spinnerEntries: [
        { id: "1", label: "Desert island item?", color: "#9333EA" },
        { id: "2", label: "Morning or night?", color: "#DC2626" },
        { id: "3", label: "Coffee or tea?", color: "#EA580C" },
        { id: "4", label: "Cats or dogs?", color: "#EAB308" },
        { id: "5", label: "Beach or mountains?", color: "#22C55E" },
        { id: "6", label: "Sweet or savory?", color: "#14B8A6" },
        { id: "7", label: "Early bird or night owl?", color: "#3B82F6" },
        { id: "8", label: "Movie genre?", color: "#1E3A8A" }
      ]
    }
  },
  {
    type: "word_cloud",
    question: "Describe your ideal weekend in one word",
    config: { elements: [] }
  }
];

const presentationTemplates: InsertTemplate[] = [
  {
    name: "Quick Opinion Poll",
    description: "Gather quick opinions from your audience on any topic. Perfect for meetings, events, and group decisions.",
    category: "polls",
    featured: true,
    slides: quickOpinionPollSlides,
    colorScheme: {
      primary: "#2563eb",
      secondary: "#dbeafe",
      accent: "#3b82f6",
      background: "#ffffff",
      text: "#1e293b",
      textMuted: "#64748b"
    }
  },
  {
    name: "Decision Making Poll",
    description: "Help your team make collective decisions with structured voting. Great for choosing between options.",
    category: "polls",
    featured: true,
    slides: decisionMakingPollSlides,
    colorScheme: {
      primary: "#0891b2",
      secondary: "#cffafe",
      accent: "#06b6d4",
      background: "#f0fdfa",
      text: "#134e4a",
      textMuted: "#0d9488"
    }
  },
  {
    name: "Trivia Quiz",
    description: "Fun general knowledge quiz to test and engage your audience. Great for team bonding and entertainment.",
    category: "quizzes",
    featured: true,
    slides: triviaQuizSlides,
    colorScheme: {
      primary: "#9333ea",
      secondary: "#f3e8ff",
      accent: "#a855f7",
      background: "#faf5ff",
      text: "#581c87",
      textMuted: "#7e22ce"
    }
  },
  {
    name: "Training Assessment",
    description: "Assess learning outcomes after training sessions. Track understanding and identify knowledge gaps.",
    category: "quizzes",
    featured: true,
    slides: trainingQuizSlides,
    colorScheme: {
      primary: "#4f46e5",
      secondary: "#e0e7ff",
      accent: "#6366f1",
      background: "#eef2ff",
      text: "#3730a3",
      textMuted: "#4f46e5"
    }
  },
  {
    name: "Event Feedback",
    description: "Collect comprehensive feedback after events, workshops, or conferences. Improve future events.",
    category: "feedback",
    featured: true,
    slides: eventFeedbackSlides,
    colorScheme: {
      primary: "#10b981",
      secondary: "#d1fae5",
      accent: "#34d399",
      background: "#f0fdf4",
      text: "#064e3b",
      textMuted: "#065f46"
    }
  },
  {
    name: "Product Feedback",
    description: "Gather user insights about your product or service. Understand satisfaction and areas for improvement.",
    category: "feedback",
    featured: true,
    slides: productFeedbackSlides,
    colorScheme: {
      primary: "#059669",
      secondary: "#a7f3d0",
      accent: "#10b981",
      background: "#ecfdf5",
      text: "#065f46",
      textMuted: "#047857"
    }
  },
  {
    name: "Team Introduction",
    description: "Help new team members introduce themselves. Perfect for onboarding and team building.",
    category: "icebreakers",
    featured: true,
    slides: teamIntroductionSlides,
    colorScheme: {
      primary: "#f59e0b",
      secondary: "#fef3c7",
      accent: "#fbbf24",
      background: "#fffbeb",
      text: "#78350f",
      textMuted: "#a16207"
    }
  },
  {
    name: "Fun Icebreaker",
    description: "Energize your meetings with fun questions and activities. Break the ice and build connections.",
    category: "icebreakers",
    featured: true,
    slides: funIcebreakerSlides,
    colorScheme: {
      primary: "#ec4899",
      secondary: "#fce7f3",
      accent: "#f472b6",
      background: "#fdf2f8",
      text: "#831843",
      textMuted: "#be185d"
    }
  }
];

export async function seedTemplates() {
  try {
    const existingTemplates = await storage.getAllTemplates();
    
    if (existingTemplates.length === 0) {
      console.log("Seeding presentation templates...");
      
      for (const template of presentationTemplates) {
        await storage.createTemplate(template);
      }
      
      console.log(`Seeded ${presentationTemplates.length} presentation templates`);
    } else {
      console.log(`Templates already exist (${existingTemplates.length} templates found)`);
    }
  } catch (error) {
    console.error("Error seeding templates:", error);
  }
}
