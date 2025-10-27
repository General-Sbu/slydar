import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { useState } from "react";
import type { Template } from "@shared/schema";

interface TemplateSelectorProps {
  templates: Template[];
  selectedTemplateId?: string | null;
  onSelect: (template: Template) => void;
}

export default function TemplateSelector({ templates, selectedTemplateId, onSelect }: TemplateSelectorProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {templates.map((template) => (
        <Card
          key={template.id}
          className={`p-4 cursor-pointer transition-all hover-elevate active-elevate-2 ${
            selectedTemplateId === template.id ? 'ring-2 ring-primary' : ''
          }`}
          onClick={() => onSelect(template)}
          data-testid={`card-template-${template.id}`}
        >
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-base leading-tight">{template.name}</h3>
              {selectedTemplateId === template.id && (
                <div className="rounded-full bg-primary p-1 flex-shrink-0">
                  <Check className="h-3 w-3 text-primary-foreground" />
                </div>
              )}
            </div>
            
            <p className="text-sm text-muted-foreground line-clamp-2">
              {template.description}
            </p>
            
            <div className="space-y-2">
              <div className="text-xs font-medium text-muted-foreground">Color Palette</div>
              <div className="grid grid-cols-6 gap-1">
                <div 
                  className="h-8 rounded border border-border"
                  style={{ backgroundColor: template.colorScheme.primary }}
                  title="Primary"
                />
                <div 
                  className="h-8 rounded border border-border"
                  style={{ backgroundColor: template.colorScheme.secondary }}
                  title="Secondary"
                />
                <div 
                  className="h-8 rounded border border-border"
                  style={{ backgroundColor: template.colorScheme.accent }}
                  title="Accent"
                />
                <div 
                  className="h-8 rounded border border-border"
                  style={{ backgroundColor: template.colorScheme.background }}
                  title="Background"
                />
                <div 
                  className="h-8 rounded border border-border"
                  style={{ backgroundColor: template.colorScheme.text }}
                  title="Text"
                />
                <div 
                  className="h-8 rounded border border-border"
                  style={{ backgroundColor: template.colorScheme.textMuted }}
                  title="Text Muted"
                />
              </div>
            </div>
            
            <div 
              className="p-3 rounded-md border"
              style={{
                backgroundColor: template.colorScheme.background,
                borderColor: template.colorScheme.secondary
              }}
            >
              <div 
                className="text-xs font-medium mb-1"
                style={{ color: template.colorScheme.text }}
              >
                Sample Heading
              </div>
              <div 
                className="text-xs"
                style={{ color: template.colorScheme.textMuted }}
              >
                Preview text
              </div>
              <div 
                className="mt-2 h-1 w-3/4 rounded"
                style={{ backgroundColor: template.colorScheme.primary }}
              />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
