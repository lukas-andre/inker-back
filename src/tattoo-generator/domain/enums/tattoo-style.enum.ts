export enum TattooStyle {
  TRADITIONAL_AMERICAN = 'traditionalAmerican',
  NEOTRADITIONAL = 'neotraditional',
  REALISM = 'realism',
  WATERCOLOR = 'watercolor',
  GEOMETRIC = 'geometric',
  BLACKWORK = 'blackwork',
  DOTWORK = 'dotwork',
  JAPANESE = 'japanese',
  TRIBAL = 'tribal',
  NEW_SCHOOL = 'newSchool',
  BIOMECHANICAL = 'biomechanical',
  MINIMALIST = 'minimalist',
  SURREALISM = 'surrealism',
  ORNAMENTAL = 'ornamental',
  NEO_JAPANESE = 'neoJapanese',
  CELTIC = 'celtic',
  CHICANO = 'chicano',
  ABSTRACT = 'abstract',
  MANDALA = 'mandala',
  FINELINE = 'fineline',
  IGNORANT_STYLE = 'ignorantStyle',
}

export const TattooStyleDescriptions: Record<TattooStyle, string> = {
  [TattooStyle.TRADITIONAL_AMERICAN]:
    'Bold black outlines|Limited color palette (red, yellow, green)|Nautical motifs (anchors, swallows)|2D flat appearance|High contrast shading',

  [TattooStyle.NEOTRADITIONAL]:
    'Extended color spectrum|Illustrative depth|Ornamental details|Mixed line weights|Modernized traditional themes',

  [TattooStyle.REALISM]:
    'Photographic detail|Advanced shading techniques|3D illusion|Portrait precision|Black/grey or color variants',

  [TattooStyle.WATERCOLOR]:
    'No outlines|Fluid color transitions|Brushstroke textures|Negative space usage|Abstract color splashes',

  [TattooStyle.GEOMETRIC]:
    'Sacred geometry|Precision linework|Symmetrical patterns|Fractal elements|Optical illusions',

  [TattooStyle.BLACKWORK]:
    'Solid black fills|High contrast|Negative space play|Graphic patterns|Cultural symbolism',

  [TattooStyle.DOTWORK]:
    `Create a dotwork/stippling tattoo design with these characteristics:
- Composition formed entirely of dots with no solid lines
- Varying dot density to create shading, contrast and dimension
- Areas of high dot concentration for darker regions
- Areas of sparse dots or negative space for lighter regions
- Dots should be precise and deliberately placed
- Subject matter should be recognizable through dot patterns alone
- Consider how the design will age (dots may spread slightly over time)

The overall aesthetic should be meticulous and precise, with a focus on how the varying density of dots creates form, depth, and texture. The design should work particularly well for detailed subjects with subtle gradients and textures.
`,

  [TattooStyle.JAPANESE]:
    'Irezumi tradition|Full-body suit approach|Mythical creatures (dragons, koi)|Wave and cloud motifs|Symbolic color coding',

  [TattooStyle.TRIBAL]:
    'Cultural patterns|Black silhouette focus|Body contouring|Spiritual symbolism|Polynesian/Maori roots',

  [TattooStyle.NEW_SCHOOL]:
    'Cartoonish proportions|Graffiti influences|Surreal elements|Vibrant color saturation|Pop culture themes',

  [TattooStyle.BIOMECHANICAL]:
    'Cybernetic fusion|Anatomical precision|Gear/cable integration|3D depth illusion|Sci-fi aesthetic',

  [TattooStyle.MINIMALIST]:
    'Single needle work|Negative space focus|Simplified forms|Micro-scale designs|Hidden meanings',

  [TattooStyle.SURREALISM]:
    'Dream logic composition|Floating elements|Metaphorical imagery|Reality distortion|Freudian symbolism',

  [TattooStyle.ORNAMENTAL]:
    'Henna-inspired patterns|Lace-like details|Symmetrical repetition|Body flow adaptation|Decorative blackwork',

  [TattooStyle.NEO_JAPANESE]:
    'Anime influences|Vibrant color gradients|Dynamic compositions|Modernized traditional elements|Cultural fusion',

  [TattooStyle.CELTIC]:
    'Knotwork complexity|Spiral motifs|Interlaced patterns|Historical symbolism|Shield/Cross variations',

  [TattooStyle.CHICANO]:
    'Prison-style origins|Black/grey palette|Fine line shading|Cultural iconography|Barrio aesthetics',

  [TattooStyle.ABSTRACT]:
    'Non-representational forms|Emotional expression|Geometric abstraction|Color field theory|Modern art influences',

  [TattooStyle.MANDALA]:
    'Radial symmetry|Sacred geometry|Meditative patterns|Lotus motifs|Spiritual balance symbolism',

  [TattooStyle.FINELINE]:
    'Single needle precision|Delicate contours|Micro-shading|Negative space mastery|Hidden details',

  [TattooStyle.IGNORANT_STYLE]:
    'Anti-technique aesthetic|DIY appearance|Satirical themes|Bold line simplicity|Pop art irony',
};


const StyleColorInfo: Record<TattooStyle, 'color' | 'blackAndGrey' | 'blackwork' | 'flexible'> = {
  [TattooStyle.TRADITIONAL_AMERICAN]: 'color', // Paleta limitada pero color
  [TattooStyle.NEOTRADITIONAL]: 'color',
  [TattooStyle.REALISM]: 'flexible', // Puede ser B&G o Color
  [TattooStyle.WATERCOLOR]: 'color',
  [TattooStyle.GEOMETRIC]: 'flexible', // A menudo negro, pero puede tener color
  [TattooStyle.BLACKWORK]: 'blackwork',
  [TattooStyle.DOTWORK]: 'blackwork', // Predominantemente puntos negros
  [TattooStyle.JAPANESE]: 'color', // Tradicionalmente usa color simbólico
  [TattooStyle.TRIBAL]: 'blackwork',
  [TattooStyle.NEW_SCHOOL]: 'color',
  [TattooStyle.BIOMECHANICAL]: 'flexible', // Puede ser B&G o Color
  [TattooStyle.MINIMALIST]: 'flexible', // A menudo negro, pero no exclusivo
  [TattooStyle.SURREALISM]: 'flexible',
  [TattooStyle.ORNAMENTAL]: 'blackwork', // A menudo negro, como encaje
  [TattooStyle.NEO_JAPANESE]: 'color',
  [TattooStyle.CELTIC]: 'blackwork', // Tradicionalmente negro o un color sólido
  [TattooStyle.CHICANO]: 'blackAndGrey',
  [TattooStyle.ABSTRACT]: 'flexible',
  [TattooStyle.MANDALA]: 'flexible', // A menudo negro, pero popular con color
  [TattooStyle.FINELINE]: 'flexible', // A menudo negro, pero no exclusivo
  [TattooStyle.IGNORANT_STYLE]: 'flexible', // Simple, puede ser color o negro
};

export function getColorInstruction(style: TattooStyle): string {
  switch (StyleColorInfo[style]) {
    case 'color':
      return 'using a vibrant and appropriate color palette for the style';
    case 'blackAndGrey':
      return 'rendered primarily in black and grey with smooth shading';
    case 'blackwork':
      return 'using solid black ink with high contrast and negative space';
    case 'flexible':
    default:
      // Para estilos flexibles, podríamos decidir basándonos en el input o dejarlo más abierto.
      // Por ahora, seremos un poco más genéricos o podríamos incluso añadir una opción de usuario.
      // Opcionalmente, podríamos especificar 'in color' o 'in black and grey' aleatoriamente o basado en algún otro factor.
      // Una opción segura es especificar ambos para que el modelo elija o genere ambas variantes si es posible (depende del modelo de IA).
      // Vamos a optar por una instrucción más abierta para flexibilidad:
      return 'using appropriate shading and contrast, potentially with color or in black and grey';
    // Alternativa: return 'using color'; // Forzar color si no se especifica B&G
    // Alternativa: return 'in black and grey'; // Forzar B&G si no se especifica color
  }
}
