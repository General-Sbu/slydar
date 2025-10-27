import { storage } from "./storage";
import type { InsertTemplate } from "@shared/schema";

const defaultTemplates: InsertTemplate[] = [
  {
    name: "Professional Blue",
    description: "Clean and professional design with blue accents, perfect for business presentations",
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
    colorScheme: {
      primary: "#8b5cf6",
      secondary: "#1e1b4b",
      accent: "#a78bfa",
      background: "#0f172a",
      text: "#f1f5f9",
      textMuted: "#94a3b8"
    }
  },
  {
    name: "Warm Sunset",
    description: "Warm and inviting orange theme, great for creative presentations",
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
    name: "Fresh Green",
    description: "Natural green palette perfect for environmental or health topics",
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
    name: "Elegant Purple",
    description: "Sophisticated purple theme with elegant styling",
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
    name: "Bold Red",
    description: "High-impact red theme for attention-grabbing presentations",
    colorScheme: {
      primary: "#dc2626",
      secondary: "#fee2e2",
      accent: "#ef4444",
      background: "#fef2f2",
      text: "#7f1d1d",
      textMuted: "#991b1b"
    }
  },
  {
    name: "Ocean Blue",
    description: "Calming ocean-inspired blue tones for serene presentations",
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
    name: "Minimal Gray",
    description: "Minimalist grayscale design focusing on content over colors",
    colorScheme: {
      primary: "#475569",
      secondary: "#f1f5f9",
      accent: "#64748b",
      background: "#ffffff",
      text: "#0f172a",
      textMuted: "#475569"
    }
  }
];

export async function seedTemplates() {
  try {
    const existingTemplates = await storage.getAllTemplates();
    
    if (existingTemplates.length === 0) {
      console.log("Seeding default templates...");
      
      for (const template of defaultTemplates) {
        await storage.createTemplate(template);
      }
      
      console.log(`✅ Seeded ${defaultTemplates.length} default templates`);
    } else {
      console.log(`Templates already exist (${existingTemplates.length} templates found)`);
    }
  } catch (error) {
    console.error("Error seeding templates:", error);
  }
}
