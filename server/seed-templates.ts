import { storage } from "./storage";
import type { InsertTemplate, TemplateSlide } from "@shared/schema";

const pollSlides: TemplateSlide[] = [
  {
    type: "heading",
    title: "Welcome to Our Poll",
    config: { elements: [{ type: "text", id: "title", content: "Welcome to Our Poll", x: 10, y: 40, width: 80, fontSize: 48, fontWeight: "bold", textAlign: "center", zIndex: 1 }] }
  },
  {
    type: "multiple_choice",
    question: "What's your preferred option?",
    options: ["Option A", "Option B", "Option C", "Option D"],
    config: { elements: [] }
  },
  {
    type: "multiple_choice",
    question: "How satisfied are you with our service?",
    options: ["Very Satisfied", "Satisfied", "Neutral", "Unsatisfied"],
    config: { elements: [] }
  }
];

const quizSlides: TemplateSlide[] = [
  {
    type: "heading",
    title: "Quiz Time!",
    config: { elements: [{ type: "text", id: "title", content: "Quiz Time!", x: 10, y: 35, width: 80, fontSize: 56, fontWeight: "bold", textAlign: "center", zIndex: 1 }] }
  },
  {
    type: "multiple_choice",
    question: "Question 1: What is the answer?",
    options: ["Answer A", "Answer B", "Answer C", "Answer D"],
    config: { elements: [] }
  },
  {
    type: "multiple_choice",
    question: "Question 2: Select the correct option",
    options: ["Choice 1", "Choice 2", "Choice 3", "Choice 4"],
    config: { elements: [] }
  },
  {
    type: "multiple_choice",
    question: "Question 3: True or False?",
    options: ["True", "False"],
    config: { elements: [] }
  }
];

const feedbackSlides: TemplateSlide[] = [
  {
    type: "heading",
    title: "We Value Your Feedback",
    config: { elements: [{ type: "text", id: "title", content: "We Value Your Feedback", x: 10, y: 40, width: 80, fontSize: 48, fontWeight: "bold", textAlign: "center", zIndex: 1 }] }
  },
  {
    type: "multiple_choice",
    question: "How would you rate today's session?",
    options: ["Excellent", "Good", "Average", "Needs Improvement"],
    config: { elements: [] }
  },
  {
    type: "word_cloud",
    question: "What did you enjoy most?",
    config: { elements: [] }
  },
  {
    type: "open_ended",
    question: "Any suggestions for improvement?",
    config: { elements: [] }
  }
];

const icebreakerSlides: TemplateSlide[] = [
  {
    type: "heading",
    title: "Let's Get Started!",
    config: { elements: [{ type: "text", id: "title", content: "Let's Get Started!", x: 10, y: 35, width: 80, fontSize: 52, fontWeight: "bold", textAlign: "center", zIndex: 1 }] }
  },
  {
    type: "word_cloud",
    question: "Where are you joining from today?",
    config: { elements: [] }
  },
  {
    type: "multiple_choice",
    question: "How are you feeling today?",
    options: ["Energetic", "Relaxed", "Curious", "Excited"],
    config: { elements: [] }
  },
  {
    type: "spinner",
    question: "Spin to pick a topic!",
    config: { 
      elements: [],
      spinnerEntries: [
        { id: "1", label: "Introduce yourself", color: "#9333EA" },
        { id: "2", label: "Share a fun fact", color: "#DC2626" },
        { id: "3", label: "Your favorite hobby", color: "#EA580C" },
        { id: "4", label: "Dream vacation", color: "#EAB308" },
        { id: "5", label: "Favorite food", color: "#22C55E" },
        { id: "6", label: "Best advice", color: "#14B8A6" },
        { id: "7", label: "Hidden talent", color: "#3B82F6" },
        { id: "8", label: "Fun memory", color: "#1E3A8A" }
      ]
    }
  }
];

const educationSlides: TemplateSlide[] = [
  {
    type: "heading",
    title: "Today's Lesson",
    config: { elements: [{ type: "text", id: "title", content: "Today's Lesson", x: 10, y: 40, width: 80, fontSize: 52, fontWeight: "bold", textAlign: "center", zIndex: 1 }] }
  },
  {
    type: "word_cloud",
    question: "What do you already know about this topic?",
    config: { elements: [] }
  },
  {
    type: "multiple_choice",
    question: "Quick check: Select the correct answer",
    options: ["Answer A", "Answer B", "Answer C", "Answer D"],
    config: { elements: [] }
  },
  {
    type: "open_ended",
    question: "What questions do you have?",
    config: { elements: [] }
  }
];

const businessSlides: TemplateSlide[] = [
  {
    type: "heading",
    title: "Team Meeting",
    config: { elements: [{ type: "text", id: "title", content: "Team Meeting", x: 10, y: 40, width: 80, fontSize: 52, fontWeight: "bold", textAlign: "center", zIndex: 1 }] }
  },
  {
    type: "multiple_choice",
    question: "What should we prioritize this quarter?",
    options: ["Product Development", "Customer Acquisition", "Team Growth", "Process Optimization"],
    config: { elements: [] }
  },
  {
    type: "word_cloud",
    question: "Share one word that describes our team",
    config: { elements: [] }
  },
  {
    type: "open_ended",
    question: "What blockers are you facing?",
    config: { elements: [] }
  }
];

const presentationTemplates: InsertTemplate[] = [
  {
    name: "Quick Poll",
    description: "Gather audience opinions with multiple choice polls. Perfect for quick decisions and voting.",
    category: "polls",
    featured: true,
    slides: pollSlides,
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
    name: "Interactive Quiz",
    description: "Test knowledge with engaging quiz questions. Great for training and education.",
    category: "quizzes",
    featured: true,
    slides: quizSlides,
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
    name: "Session Feedback",
    description: "Collect valuable feedback from your audience. Rate sessions and gather suggestions.",
    category: "feedback",
    featured: true,
    slides: feedbackSlides,
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
    name: "Team Icebreaker",
    description: "Break the ice with fun interactive activities. Perfect for team meetings and events.",
    category: "icebreakers",
    featured: true,
    slides: icebreakerSlides,
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
    name: "Classroom Engagement",
    description: "Keep students engaged with interactive lesson slides. Perfect for teachers and trainers.",
    category: "education",
    featured: true,
    slides: educationSlides,
    colorScheme: {
      primary: "#0284c7",
      secondary: "#e0f2fe",
      accent: "#0ea5e9",
      background: "#f0f9ff",
      text: "#0c4a6e",
      textMuted: "#075985"
    }
  },
  {
    name: "Business Meeting",
    description: "Run engaging team meetings with polls and brainstorming. Great for standups and retrospectives.",
    category: "business",
    featured: true,
    slides: businessSlides,
    colorScheme: {
      primary: "#475569",
      secondary: "#f1f5f9",
      accent: "#64748b",
      background: "#ffffff",
      text: "#0f172a",
      textMuted: "#475569"
    }
  },
  {
    name: "Professional Blue",
    description: "Clean and professional design with blue accents, perfect for business presentations",
    category: "general",
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
    name: "Modern Dark",
    description: "Sleek dark theme with vibrant purple accents for a modern look",
    category: "general",
    colorScheme: {
      primary: "#8b5cf6",
      secondary: "#1e1b4b",
      accent: "#a78bfa",
      background: "#0f172a",
      text: "#f1f5f9",
      textMuted: "#94a3b8"
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
    } else if (existingTemplates.length < presentationTemplates.length) {
      console.log("Updating templates with new entries...");
      const existingNames = existingTemplates.map(t => t.name);
      
      for (const template of presentationTemplates) {
        if (!existingNames.includes(template.name)) {
          await storage.createTemplate(template);
          console.log(`Added new template: ${template.name}`);
        }
      }
    } else {
      console.log(`Templates already exist (${existingTemplates.length} templates found)`);
    }
  } catch (error) {
    console.error("Error seeding templates:", error);
  }
}
