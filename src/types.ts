export interface UserInputs {
  food: string;
  mainIngredient: string;
  environment: string;
  imageStyle: string;
  videoCount: number;
  aspectRatio: string;
  voiceLanguage: string;
  voiceTone: string;
  actionDetail: string;
  
  // Character Image Options
  enableCharImage: boolean;
  bodyShape?: string;
  headAccessory?: string;
  extraAccessory?: string;
  expression?: string;
  pose?: string;
  furColor?: string;
  charImageStyle?: string;
}

export interface GeneratedPrompts {
  characterPrompt?: string;
  imagePrompts: string[];
  videoPrompts: string[];
}
