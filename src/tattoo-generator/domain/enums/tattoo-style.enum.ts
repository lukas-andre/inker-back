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
    'Stippling technique|Density gradients|Textured shading|Dot clusters|Mandala constructions',

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
