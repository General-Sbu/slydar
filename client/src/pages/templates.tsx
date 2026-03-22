import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useNotification } from "@/hooks/useNotification";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { BarChart3, MessageSquare, Users, HelpCircle, GraduationCap, Briefcase, Layers, Star, Eye, Plus, Sparkles } from "lucide-react";
import type { Template, TemplateSlide } from "@shared/schema";

const categoryConfig: Record<string, { label: string; icon: typeof BarChart3 }> = {
  all:          { label: "All",          icon: Layers },
  polls:        { label: "Polls",        icon: BarChart3 },
  quizzes:      { label: "Quizzes",      icon: HelpCircle },
  feedback:     { label: "Feedback",     icon: MessageSquare },
  icebreakers:  { label: "Ice Breakers", icon: Users },
  education:    { label: "Education",    icon: GraduationCap },
  business:     { label: "Business",     icon: Briefcase },
  general:      { label: "General",      icon: Layers },
};

function TemplateCard({
  template,
  onPreview,
  onUse,
}: {
  template: Template;
  onPreview: () => void;
  onUse: () => void;
}) {
  const cfg = categoryConfig[template.category || "general"] || categoryConfig.general;
  const Icon = cfg.icon;

  return (
    <Card
      className="group relative overflow-hidden hover-elevate transition-all duration-300"
      data-testid={`template-card-${template.id}`}
    >
      <div
        className="h-32 w-full flex items-center justify-center relative"
        style={{ backgroundColor: template.colorScheme?.background || "#f8fafc" }}
      >
        <div
          className="w-16 h-16 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: template.colorScheme?.primary || "#3b82f6" }}
        >
          <Icon className="w-8 h-8 text-white" />
        </div>
        {template.featured && (
          <Badge className="absolute top-2 right-2 bg-amber-500 hover:bg-amber-600">
            <Star className="w-3 h-3 mr-1" />
            Featured
          </Badge>
        )}
      </div>

      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-semibold text-foreground line-clamp-1">{template.name}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{template.description}</p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            <Icon className="w-3 h-3 mr-1" />
            {cfg.label}
          </Badge>
          {template.slides && template.slides.length > 0 && (
            <Badge variant="outline" className="text-xs">
              {template.slides.length} slides
            </Badge>
          )}
        </div>

        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={onPreview}
            data-testid={`preview-template-${template.id}`}
          >
            <Eye className="w-4 h-4 mr-1" />
            Preview
          </Button>
          <Button
            size="sm"
            className="flex-1"
            onClick={onUse}
            data-testid={`use-template-${template.id}`}
          >
            <Plus className="w-4 h-4 mr-1" />
            Use
          </Button>
        </div>
      </div>
    </Card>
  );
}

function TemplatePreviewDialog({
  template,
  open,
  onClose,
  onUse,
}: {
  template: Template | null;
  open: boolean;
  onClose: () => void;
  onUse: () => void;
}) {
  if (!template) return null;

  const cfg = categoryConfig[template.category || "general"] || categoryConfig.general;
  const Icon = cfg.icon;
  const slides = (template.slides as TemplateSlide[]) || [];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: template.colorScheme?.primary || "#3b82f6" }}
            >
              <Icon className="w-4 h-4 text-white" />
            </div>
            {template.name}
          </DialogTitle>
          <DialogDescription>{template.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              <Icon className="w-3 h-3 mr-1" />
              {cfg.label}
            </Badge>
            {slides.length > 0 && (
              <Badge variant="outline">{slides.length} pre-built slides</Badge>
            )}
          </div>

          {slides.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium text-sm text-muted-foreground">Included Slides</h4>
              <div className="grid gap-2">
                {slides.map((slide, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                  >
                    <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {slide.title || slide.question || `${slide.type.replace("_", " ")} slide`}
                      </p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {slide.type.replace("_", " ")}
                        {slide.options && ` - ${slide.options.length} options`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <h4 className="font-medium text-sm text-muted-foreground">Color Scheme</h4>
            <div className="flex gap-2">
              {template.colorScheme &&
                Object.entries(template.colorScheme)
                  .slice(0, 4)
                  .map(([key, color]) => (
                    <div key={key} className="text-center">
                      <div
                        className="w-10 h-10 rounded-lg border"
                        style={{ backgroundColor: color }}
                      />
                      <span className="text-[10px] text-muted-foreground capitalize">{key}</span>
                    </div>
                  ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button onClick={onUse} data-testid="use-template-dialog">
            <Sparkles className="w-4 h-4 mr-2" />
            Use This Template
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function Templates() {
  const [, setLocation] = useLocation();
  const { showNotification } = useNotification();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);

  const { data: templates = [], isLoading } = useQuery<Template[]>({
    queryKey: ["/api/templates"],
  });

  const createFromTemplateMutation = useMutation({
    mutationFn: async (templateId: string) => {
      const response = await apiRequest("POST", "/api/presentations/from-template", {
        templateId,
      });
      return response.json();
    },
    onSuccess: (presentation: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/presentations"] });
      showNotification("Presentation created from template!", "success");
      setLocation(`/editor/${presentation.id}`);
    },
    onError: (error: Error) => {
      showNotification(error.message || "Failed to create presentation", "error");
    },
  });

  const handleUseTemplate = (template: Template) => {
    createFromTemplateMutation.mutate(template.id);
  };

  const categoriesWithCounts = Object.keys(categoryConfig).filter((key) => {
    if (key === "all") return true;
    return templates.some((t) => t.category === key);
  }).map((key) => ({
    key,
    count: key === "all" ? templates.length : templates.filter((t) => t.category === key).length,
  }));

  const filteredTemplates =
    selectedCategory === "all"
      ? templates
      : templates.filter((t) => t.category === selectedCategory);

  const featuredTemplates =
    selectedCategory === "all" ? templates.filter((t) => t.featured) : [];

  const browseTemplates =
    selectedCategory === "all"
      ? templates.filter((t) => !t.featured)
      : filteredTemplates;

  return (
    <div className="min-h-screen p-6 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Template Library</h1>
        <p className="text-muted-foreground">
          Choose from pre-built templates to get started quickly with polls, quizzes, feedback, and more.
        </p>
      </div>

      {/* Category Selector */}
      <div className="flex flex-wrap gap-2" data-testid="category-selector">
        {isLoading
          ? Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-9 w-24 rounded-md" />
            ))
          : categoriesWithCounts.map(({ key, count }) => {
              const cfg = categoryConfig[key];
              const Icon = cfg.icon;
              const isActive = selectedCategory === key;
              return (
                <button
                  key={key}
                  onClick={() => setSelectedCategory(key)}
                  data-testid={`category-filter-${key}`}
                  className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium border transition-colors hover-elevate ${
                    isActive
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background text-foreground border-border"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {cfg.label}
                  <span
                    className={`ml-0.5 text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                      isActive
                        ? "bg-primary-foreground/20 text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
      </div>

      {/* Featured Templates (only shown on "All") */}
      {featuredTemplates.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-500" />
            Featured
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {featuredTemplates.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                onPreview={() => setPreviewTemplate(template)}
                onUse={() => handleUseTemplate(template)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Main Grid */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">
          {selectedCategory === "all"
            ? "All Templates"
            : `${categoryConfig[selectedCategory]?.label ?? selectedCategory} Templates`}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {isLoading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="h-32 w-full" />
                <div className="p-4 space-y-3">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <div className="flex gap-2">
                    <Skeleton className="h-8 flex-1" />
                    <Skeleton className="h-8 flex-1" />
                  </div>
                </div>
              </Card>
            ))
          ) : browseTemplates.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground">No templates found in this category.</p>
            </div>
          ) : (
            browseTemplates.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                onPreview={() => setPreviewTemplate(template)}
                onUse={() => handleUseTemplate(template)}
              />
            ))
          )}
        </div>
      </div>

      <TemplatePreviewDialog
        template={previewTemplate}
        open={!!previewTemplate}
        onClose={() => setPreviewTemplate(null)}
        onUse={() => {
          if (previewTemplate) {
            handleUseTemplate(previewTemplate);
          }
        }}
      />
    </div>
  );
}
