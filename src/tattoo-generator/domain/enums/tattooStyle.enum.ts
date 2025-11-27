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
  [TattooStyle.TRADITIONAL_AMERICAN]: `Create an American Traditional (Old School) tattoo design with these authentic characteristics:
- Heavy, bold black outlines of consistent thickness
- Limited but vibrant color palette (primarily black, red, green, yellow, blue)
- Simplified, iconic imagery with strong silhouettes
- Classic nautical and maritime motifs (anchors, ships, swallows)
- Traditional elements like roses, daggers, eagles, panthers, or skulls
- Design elements separated by clear black borders
- Minimal shading with solid color fills
- Banner/scroll elements with lettering
- Small stars or dots as space fillers
- Flat 2D appearance with high contrast

The design should capture the timeless, straightforward aesthetic originated by pioneers like Sailor Jerry, emphasizing readability and longevity.`,

  [TattooStyle.NEOTRADITIONAL]: `Create a Neotraditional tattoo design with these distinctive characteristics:
- Richer, expanded color palette beyond traditional primary colors
- Dynamic line weights that vary from bold to fine
- Illustrative quality with greater artistic depth and dimension
- Ornate decorative elements and flourishes
- Art nouveau and art deco influences in composition
- Modernized traditional themes with contemporary aesthetics
- More realistic proportions while maintaining stylization
- Detailed shading techniques and color gradients
- Incorporation of negative space as design element
- Fusion of traditional tattoo foundation with modern illustration techniques

The design should feel like an evolved version of traditional tattooing, with enhanced artistic complexity while maintaining the bold readability of traditional work.`,

  [TattooStyle.REALISM]: `Create a Realistic tattoo design with these technical characteristics:
- Photographic level of detail and precision
- Advanced shading techniques creating smooth gradients
- Three-dimensional illusion of depth and form
- Accurate anatomical proportions and perspective
- Subtle color transitions (for color realism) or nuanced grey tones (for black and grey)
- Hyperrealistic textures (skin, fabric, metal, etc.)
- Strategic use of highlights and shadows to create volume
- Minimal to no outlines, relying instead on shading for definition
- Portrait-level accuracy if depicting faces or figures
- Careful attention to lighting sources and reflections

The design should appear as though a photograph has been perfectly transferred onto skin, demonstrating mastery of light, shadow, texture, and dimension.`,

  [TattooStyle.WATERCOLOR]: `Create a Watercolor tattoo design with these artistic characteristics:
- Fluid, spontaneous color transitions mimicking watercolor paint
- Absence of defining black outlines or limited outline use
- Splashes, drips, and paint splatters for organic aesthetic
- Brushstroke textures and transparent color overlays
- Strategic use of negative space for brightness and breathing room
- Color bleeding and bleeding edges for authentic paint effect
- Vibrant, often pastel or jewel-toned color palette
- Abstract background elements that frame the main subject
- Impression of paint spreading on paper/skin
- Emphasis on movement and flow through color placement

The design should capture the ephemeral, flowy aesthetic of watercolor paintings, creating the illusion that the colors have been painted directly onto skin with a watercolor brush.`,

  [TattooStyle.GEOMETRIC]: `Create a Geometric tattoo design with these precise characteristics:
- Composition built entirely from mathematical shapes (circles, triangles, squares, hexagons)
- Perfect symmetry and proportional harmony
- Sacred geometry patterns (flower of life, metatron's cube)
- Precise, clean linework of consistent weight
- Fractal elements and recursive patterns
- Optical illusions and perspective tricks
- Strategic blackwork fills in certain shapes for contrast
- Dotwork shading to create depth while maintaining geometric integrity
- Mathematical precision in all measurements and angles
- Transformation of organic subjects into geometric forms

The design should demonstrate mathematical precision and balance, transforming natural subjects into their geometric essence through perfect shapes, symmetry, and proportion.`,

  [TattooStyle.BLACKWORK]: `Create a Blackwork tattoo design with these striking characteristics:
- Solid, dense black ink fills with no gradients
- High contrast between black elements and skin (negative space)
- Graphic, bold patterns with clear silhouettes
- Cultural symbolism from various traditions (Polynesian, Maori, etc.)
- Woodcut or engraving-inspired technique
- Decisive placement of negative space for visual balance
- Geometric patterns and repetitive motifs
- Clean, crisp edges between black and negative space
- Consideration of how design flows with body contours
- Modern graphic design influences

The design should make powerful use of solid black ink to create striking silhouettes and bold patterns that emphasize contrast and visual impact over detail and color.`,

  [TattooStyle.DOTWORK]: `Create a Dotwork/Stippling tattoo design with these meticulous characteristics:
- Composition formed entirely of precisely placed dots with no solid lines
- Varying dot density to create shading, contrast, and dimension
- Areas of high concentration for darker regions
- Areas of sparse dots or negative space for lighter regions
- Mandala-like precision in dot placement and pattern creation
- Fine detail achieved through dot clustering techniques
- Subject matter defined solely through dot patterns and density
- Sacred geometry foundations often incorporated
- Dotwork patterns that flow with body contours
- Meditation-inspired repetitive patterns

The design should demonstrate extraordinary patience and precision, using only dots to create form, depth, and texture. The varying density of dots should create a detailed image that appears almost three-dimensional.`,

  [TattooStyle.JAPANESE]: `Create a Japanese traditional (Irezumi) tattoo design with these authentic characteristics:
- Bold, flowing black outlines with dynamic line weight
- Strategic use of negative space (allowing skin to show through)
- Traditional color palette (black, red, blue, green, yellow)
- Background elements like waves, clouds, wind bars, and cherry blossoms
- Mythological creatures (dragons, koi, phoenix, oni)
- Design composed for full-body suit approach (even in smaller pieces)
- Symbolic color coding according to traditional meanings
- Water and natural elements flowing with body contours
- Seasonal flowers and nature motifs with cultural significance
- Strong contrast between elements for visual impact

The design should honor the centuries-old Japanese tattoo tradition of Irezumi, demonstrating understanding of its composition rules, motif meanings, and aesthetic principles.`,

  [TattooStyle.TRIBAL]: `Create a Tribal tattoo design with these cultural characteristics:
- Bold black silhouettes with solid fills
- Patterns designed to contour and enhance body shape
- Symbolic elements from Polynesian, Māori, Samoan, or other Indigenous cultures
- Meaningful pattern placement according to cultural tradition
- Interlocking curved and angular forms
- Spiritual and ancestral symbolism within pattern details
- Balanced composition between solid areas and negative space
- Dynamic flow that enhances muscle definition
- Repetition of cultural motifs (spirals, spearheads, ocean waves)
- Consideration of traditional placement on body areas

The design should respect the cultural heritage of tribal tattooing traditions, understanding the symbolic meaning behind patterns while creating a bold, striking silhouette that enhances the body's natural form.`,

  [TattooStyle.NEW_SCHOOL]: `Create a New School tattoo design with these dynamic characteristics:
- Exaggerated, cartoonish proportions and perspectives
- Graffiti and comic book art influences
- Hyper-saturated, vibrant color palette
- Pop culture references and contemporary themes
- Surreal or exaggerated elements and proportions
- Bold black outlines (thicker than traditional)
- Dramatic perspective and distortion techniques
- Incorporation of text elements or bubble letters
- Playful, humorous, or satirical approach to subject matter
- Three-dimensional effects and dramatic shading

The design should be bold, colorful and playful, using exaggeration and distortion to create a contemporary, often humorous take on traditional tattoo subjects with an animated, cartoon-like quality.`,

  [TattooStyle.BIOMECHANICAL]: `Create a Biomechanical tattoo design with these science fiction characteristics:
- Seamless integration of mechanical and organic elements
- H.R. Giger-inspired aesthetic (Alien franchise influence)
- Anatomical precision blended with mechanical components
- Cybernetic fusion showing "beneath the skin" imagery
- Three-dimensional depth illusion through shading
- Pistons, gears, cables, and technological elements
- Design following muscle and bone structure
- Metallic textures and reflective surfaces
- Sci-fi aesthetic with dystopian or futuristic elements
- Custom fit to flow with specific body part contours

The design should create the illusion of the human body merged with machine, as if the skin has been peeled back to reveal a complex mechanical system underneath that follows and enhances the natural anatomy.`,

  [TattooStyle.MINIMALIST]: `Create a Minimalist tattoo design with these restrained characteristics:
- Single needle fine line work
- Essential forms reduced to their simplest expression
- Abundant negative space surrounding minimal elements
- Small scale with precise execution
- Simplified iconography conveying complex meanings
- Micro-scale details visible only upon close inspection
- Limited to no shading or single-technique shading
- Clean, uncluttered composition with breathing room
- Abstract representation of concepts through minimal lines
- Purposeful placement enhancing the minimalist aesthetic

The design should embody the "less is more" philosophy, communicating the subject with the fewest possible lines while maintaining clarity and creating an elegant, understated aesthetic.`,

  [TattooStyle.SURREALISM]: `Create a Surrealist tattoo design with these dreamlike characteristics:
- Unexpected juxtaposition of unrelated elements
- Dream logic composition defying physical laws
- Metaphorical and symbolic imagery
- Reality distortion techniques (melting, floating, transforming)
- Salvador Dalí and René Magritte influences
- Objects in impossible relationships or contexts
- Psychological and Freudian symbolism
- Hyper-realistic rendering of impossible scenarios
- Transformation or metamorphosis between subjects
- Perspective tricks and optical illusions

The design should create a dreamlike, psychological impression that challenges reality, blending highly realistic technique with impossible scenarios that evoke subconscious meanings and emotions.`,

  [TattooStyle.ORNAMENTAL]: `Create an Ornamental tattoo design with these decorative characteristics:
- Henna and mehndi-inspired intricate patterns
- Lace-like delicate linework and detail
- Perfectly symmetrical repetition of motifs
- Adaptation to body flow and anatomical contours
- Focus on decorative patterns rather than representational imagery
- Harmonious placement that enhances body features
- Jewelry-inspired elements and filigree details
- Mandalas and floral geometric patterns
- Dotwork and blackwork techniques for depth
- Spiritual and cultural symbolism within patterns

The design should transform the body part into an ornate, decorated surface through intricate, symmetrical patterns that enhance natural contours and create a jewelry-like decorative effect.`,

  [TattooStyle.NEO_JAPANESE]: `Create a Neo-Japanese tattoo design with these contemporary characteristics:
- Anime, manga, and Japanese pop culture influences
- Vibrant, expanded color palette beyond traditional Irezumi
- Dynamic compositions with modern artistic techniques
- Fusion of traditional Japanese elements with contemporary styles
- Bold linework combined with gradient color transitions
- Modern Japanese cultural references and character designs
- Traditional motifs reimagined with contemporary aesthetics
- Digital art influences in shading and color application
- Exaggerated expression and emotion in character designs
- Balance between honoring tradition and embracing innovation

The design should blend respect for traditional Japanese tattoo aesthetics with contemporary Japanese cultural influences, creating a fusion that feels both culturally connected and thoroughly modern.`,

  [TattooStyle.CELTIC]: `Create a Celtic tattoo design with these historical characteristics:
- Intricate knotwork with unbroken, interlaced lines
- Complex spiral motifs and triskelions
- Interwoven patterns that create illusion of depth
- Historic symbolism from Celtic mythology and culture
- Shield knots and protection symbols
- Celtic cross variations with traditional knotwork
- Animal forms (hounds, deer, birds) integrated into knotwork
- Mathematical precision in knot repetition and spacing
- Key patterns and maze-like border elements
- Traditional Celtic color hints (if using color)

The design should demonstrate the mathematical precision and cultural depth of authentic Celtic knotwork, creating an intricate, flowing pattern that appears to have no beginning or end.`,

  [TattooStyle.CHICANO]: `Create a Chicano tattoo design with these cultural characteristics:
- Prison art and barrio aesthetic origins
- Fine line black and grey technique with smooth gradients
- Paño art influence (prison handkerchief drawings)
- Cultural and religious iconography (Virgin Mary, sacred hearts)
- Old English lettering and script typography
- Lowrider culture elements and aesthetics
- Portrait work with family themes
- Clown/payaso imagery with dual emotions
- Urban life and barrio scenes
- Memorial and tribute elements

The design should honor the Mexican-American cultural tradition of Chicano tattooing, with its distinctive fine line black and grey technique, spiritual symbolism, and connection to street and prison art origins.`,

  [TattooStyle.ABSTRACT]: `Create an Abstract tattoo design with these artistic characteristics:
- Non-representational forms that evoke emotion rather than depict objects
- Color field theory application (for color versions)
- Shape relationships creating visual tension and harmony
- Modern art movement influences (Cubism, Abstract Expressionism)
- Emotional expression through form and composition
- Geometric abstraction of natural elements
- Deconstruction of recognizable subjects into pure form
- Dynamic movement through line direction and weight
- Spontaneous, expressive brush-like strokes
- Conceptual approach prioritizing feeling over representation

The design should challenge conventional representation by focusing on pure form, color relationships, and compositional balance to evoke emotion rather than illustrate specific subjects.`,

  [TattooStyle.MANDALA]: `Create a Mandala tattoo design with these meditative characteristics:
- Perfect radial symmetry from a central point
- Sacred geometry principles throughout composition
- Concentric circular patterns radiating outward
- Lotus flower motifs and petal arrangements
- Mathematical precision in all pattern repetitions
- Spiritual symbolism from Buddhist/Hindu traditions
- Balance between intricate detail and overall form
- Dotwork technique for shading and depth
- Meditative quality through repetitive patterns
- Harmonious composition with balanced elements

The design should create a perfect circular universe in miniature, using radial symmetry and sacred geometry to create a meditative, spiritually symbolic pattern representing cosmic harmony and balance.`,

  [TattooStyle.FINELINE]: `Create a Fine Line tattoo design with these delicate characteristics:
- Single needle precision creating extremely thin lines
- Delicate contours with minimal weight variation
- Micro-shading techniques for subtle dimension
- Negative space mastery for breathing room
- Hidden small details visible only upon close inspection
- Botanical and natural subjects with delicate details
- Architectural precision in linework and structure
- Subtle dot shading for dimension without heaviness
- Hair-thin connecting lines between elements
- Elegant simplicity in overall composition

The design should demonstrate exceptional technical precision with the thinnest possible linework, creating a delicate, refined aesthetic that appears almost impossibly detailed while maintaining an airy, elegant quality.`,

  [TattooStyle.IGNORANT_STYLE]: `Create an Ignorant Style tattoo design with these deliberately naive characteristics:
- Intentionally crude, hand-drawn aesthetic
- Anti-technique approach that rejects traditional skill metrics
- DIY punk aesthetic with raw execution
- Satirical or ironic take on tattoo traditions
- Bold, simple linework with minimal detail
- Childlike drawing quality with purposeful naivety
- Pop art and meme culture references
- Text elements with intentional misspellings or quirky fonts
- Humorous or absurdist subject matter
- Rejection of perfection in favor of expression

The design should deliberately embrace an "amateur" aesthetic as an artistic choice, using simplistic execution and ironic humor to challenge conventional tattoo standards while maintaining intentional artistic purpose.`,
};

const StyleColorInfo: Record<
  TattooStyle,
  'color' | 'blackAndGrey' | 'blackwork' | 'flexible'
> = {
  [TattooStyle.TRADITIONAL_AMERICAN]: 'color', // Limited but vibrant palette
  [TattooStyle.NEOTRADITIONAL]: 'color', // Extended color spectrum
  [TattooStyle.REALISM]: 'flexible', // Can be either B&G or Color
  [TattooStyle.WATERCOLOR]: 'color', // Color is essential to this style
  [TattooStyle.GEOMETRIC]: 'flexible', // Often black but can include color
  [TattooStyle.BLACKWORK]: 'blackwork', // Defined by solid black ink
  [TattooStyle.DOTWORK]: 'blackwork', // Predominantly black dots
  [TattooStyle.JAPANESE]: 'color', // Traditional uses symbolic colors
  [TattooStyle.TRIBAL]: 'blackwork', // Solid black is defining characteristic
  [TattooStyle.NEW_SCHOOL]: 'color', // Vibrant colors are essential
  [TattooStyle.BIOMECHANICAL]: 'flexible', // Can be B&G or color
  [TattooStyle.MINIMALIST]: 'flexible', // Often black but not exclusively
  [TattooStyle.SURREALISM]: 'flexible', // Style permits either approach
  [TattooStyle.ORNAMENTAL]: 'blackwork', // Typically black, lace-like appearance
  [TattooStyle.NEO_JAPANESE]: 'color', // Modern take on Japanese with vibrant colors
  [TattooStyle.CELTIC]: 'blackwork', // Traditionally black or single color
  [TattooStyle.CHICANO]: 'blackAndGrey', // Defined by black and grey technique
  [TattooStyle.ABSTRACT]: 'flexible', // Highly variable approach to color
  [TattooStyle.MANDALA]: 'flexible', // Common in black but popular in color
  [TattooStyle.FINELINE]: 'flexible', // Typically black but can use color
  [TattooStyle.IGNORANT_STYLE]: 'flexible', // Simple approach works in various colors
};

export function getColorInstruction(style: TattooStyle): string {
  switch (StyleColorInfo[style]) {
    case 'color':
      return "using a vibrant and appropriate color palette for this style, with strategic placement of colors to enhance the design's impact and authenticity";
    case 'blackAndGrey':
      return 'rendered exclusively in black and grey with smooth gradient shading to create depth and dimension without using any color';
    case 'blackwork':
      return 'using solid black ink with high contrast negative space, creating a powerful visual impact through the interplay of filled and empty areas';
    case 'flexible':
    default:
      return 'using the most appropriate color approach for the subject matter - this style works well with either vibrant colors or a sophisticated black and grey palette depending on the desired effect';
  }
}
