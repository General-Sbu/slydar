declare module 'spire.presentation' {
  export const Module: {
    onRuntimeInitialized: () => void;
    calledRun?: boolean;
  };
  
  export class Presentation {
    Slides: {
      Count: number;
      get(index: number): Slide;
    };
    LoadFromFile(path: string): void;
    Dispose(): void;
  }
  
  export interface Slide {
    SaveAsImage(): Image;
  }
  
  export interface Image {
    Save(path: string): void;
    Dispose(): void;
  }
}
