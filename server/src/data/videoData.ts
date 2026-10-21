import { VideoMetadata, QuizQuestion } from '../types';

export const SAMPLE_VIDEO: VideoMetadata = {
  id: 'jwst-deep-space',
  title: 'Eyes on the Cosmos: Inside the James Webb Space Telescope',
  description: 'An educational deep dive into how infrared astronomy unlocks the earliest galaxies, stellar nurseries, and exoplanet atmospheres.',
  duration: 180, // 3 minutes educational showcase
  // Uses a reliable public-domain educational MP4 stream; also handles local fallback
  videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', 
  thumbnailUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
  scenes: [
    {
      id: 'scene-1',
      title: '1. Launch & The Infrared Revolution',
      startTime: 0,
      endTime: 38,
      summary: 'Introduction to infrared astronomy and why optical telescopes cannot pierce dense cosmic dust clouds.',
      keyConcepts: ['Infrared Radiation', 'Cosmic Dust Penetration', 'Lagrange Point 2 (L2)'],
      simpleExplanation: 'Imagine looking through thick red smoke with normal sunglasses—you see nothing! But with night-vision infrared goggles, heat shines right through the smoke. Webb uses infrared goggles for outer space.',
      glossary: [
        { term: 'Infrared', definition: 'Light with longer wavelengths than visible light, perceived by humans as thermal radiation (heat).' },
        { term: 'L2 Orbit', definition: 'A gravitationally stable position 1 million miles from Earth where Webb remains shielded from the Sun and Earth.' }
      ]
    },
    {
      id: 'scene-2',
      title: '2. The Giant Gold Beryllium Mirror',
      startTime: 38,
      endTime: 75,
      summary: 'Engineering marvel of the 6.5-meter primary mirror coated in microscopic gold for maximum infrared reflectivity.',
      keyConcepts: ['Hexagonal Segment Alignment', 'Beryllium Substrate', 'Gold Vapor Coating'],
      simpleExplanation: 'Webb’s mirror is as big as a tennis court, so it had to fold up like origami inside the rocket. It uses real pure gold because gold is the best mirror for bouncing infrared light.',
      glossary: [
        { term: 'Beryllium', definition: 'A lightweight, rigid metallic element that maintains its exact shape in cryogenic deep-freeze conditions.' },
        { term: 'Hexagonal Segments', definition: '18 interlocking six-sided mirrors adjusted by nanometer-scale actuators.' }
      ]
    },
    {
      id: 'scene-3',
      title: '3. Cryogenic Sunshield & Cooling',
      startTime: 75,
      endTime: 115,
      summary: 'Deploying the five-layer Kapton sunshield to chill instruments to near absolute zero (-388°F / 40 Kelvin).',
      keyConcepts: ['Five-Layer Sunshield', 'Passive Cooling', 'Cryogenic Detectors'],
      simpleExplanation: 'If the telescope gets warm, its own heat blinds its cameras! The five-layer foil shield blocks the hot Sun like SPF 1,000,000 sunscreen, keeping the camera side freezing cold.',
      glossary: [
        { term: 'Kapton', definition: 'A space-age polyimide film that remains flexible and stable across extreme temperature differentials.' },
        { term: 'Absolute Zero', definition: 'The lowest theoretical temperature (-459.67°F or 0 Kelvin) where all atomic movement ceases.' }
      ]
    },
    {
      id: 'scene-4',
      title: '4. Peer Into the Cosmic Dawn',
      startTime: 115,
      endTime: 150,
      summary: 'Capturing the earliest stars born 13.5 billion years ago via cosmological redshift and gravitational lensing.',
      keyConcepts: ['Cosmological Redshift', 'Gravitational Lensing', 'First Stars & Galaxies'],
      simpleExplanation: 'Because the universe is stretching out like a pulled rubber band, light traveling across billions of years stretches out and turns red. Webb catches this stretched light to see what the universe looked like as a baby.',
      glossary: [
        { term: 'Redshift', definition: 'The elongation of light wavelengths toward the red end of the spectrum as the universe expands.' },
        { term: 'Gravitational Lensing', definition: 'When the gravity of massive galaxy clusters bends light like a natural magnifying glass.' }
      ]
    },
    {
      id: 'scene-5',
      title: '5. Exoplanet Atmospheres & Life Signs',
      startTime: 150,
      endTime: 180,
      summary: 'Transmission spectroscopy of distant worlds to detect water vapor, carbon dioxide, methane, and potential biosignatures.',
      keyConcepts: ['Transmission Spectroscopy', 'Biosignatures', 'Habitable Zone'],
      simpleExplanation: 'When an alien planet passes in front of its star, starlight shines through the planet’s atmosphere. Webb reads the rainbow fingerprints of that light to check if the air has water or oxygen!',
      glossary: [
        { term: 'Spectroscopy', definition: 'Analyzing how light is absorbed or emitted to reveal chemical elements and atmospheric composition.' },
        { term: 'Biosignature', definition: 'A chemical pattern or gas mixture providing scientific evidence of past or present life.' }
      ]
    }
  ],
  transcript: [
    { id: 'cue-0', start: 0, end: 5, text: 'Welcome to SceneSense. Today we examine the James Webb Space Telescope.', speaker: 'Narrator' },
    { id: 'cue-1', start: 5, end: 12, text: 'For decades, optical telescopes were blinded by thick interstellar dust and gas clouds.', speaker: 'Narrator' },
    { id: 'cue-2', start: 12, end: 20, text: 'Webb bypasses this cosmic barrier by observing in the infrared spectrum, where light slips straight through cosmic dust.', speaker: 'Astrophysicist' },
    { id: 'cue-3', start: 20, end: 30, text: 'Positioned 1 million miles away at the Second Lagrange Point, Webb operates in the quiet cold of deep space.', speaker: 'Mission Control' },
    { id: 'cue-4', start: 30, end: 38, text: 'This vantage point allows unhindered views into the oldest corners of our universe.', speaker: 'Narrator' },
    { id: 'cue-5', start: 38, end: 46, text: 'At the heart of the observatory is an iconic 6.5-meter golden primary mirror.', speaker: 'Lead Engineer' },
    { id: 'cue-6', start: 46, end: 55, text: 'Constructed from lightweight beryllium, each of its 18 hexagonal segments was folded like origami for rocket launch.', speaker: 'Lead Engineer' },
    { id: 'cue-7', start: 55, end: 65, text: 'A microscopic layer of pure vapor-deposited gold coats the mirrors to provide 98% infrared reflectivity.', speaker: 'Lead Engineer' },
    { id: 'cue-8', start: 65, end: 75, text: 'Tiny motors called actuators adjust each hexagon with nanometer precision to focus starlight into a single crystal beam.', speaker: 'Lead Engineer' },
    { id: 'cue-9', start: 75, end: 85, text: 'To detect faint heat from ancient stars, Webb itself must stay unimaginably cold.', speaker: 'Thermal Specialist' },
    { id: 'cue-10', start: 85, end: 95, text: 'A tennis court-sized sunshield with five ultra-thin Kapton membrane layers deflects solar heat.', speaker: 'Thermal Specialist' },
    { id: 'cue-11', start: 95, end: 105, text: 'While the sun-facing side withstands 230 degrees Fahrenheit, the cold science side drops to minus 388 degrees.', speaker: 'Thermal Specialist' },
    { id: 'cue-12', start: 105, end: 115, text: 'This 600-degree temperature gradient protects sensitive infrared cameras from thermal noise.', speaker: 'Thermal Specialist' },
    { id: 'cue-13', start: 115, end: 125, text: 'With cold mirrors ready, Webb looks back 13.5 billion years into cosmic dawn.', speaker: 'Narrator' },
    { id: 'cue-14', start: 125, end: 133, text: 'Due to universal expansion, the light of ancient stars underwent cosmological redshift, stretching into infrared.', speaker: 'Cosmologist' },
    { id: 'cue-15', start: 133, end: 142, text: 'Webb also utilizes gravitational lensing, where massive galaxy clusters magnify faint primordial galaxies behind them.', speaker: 'Cosmologist' },
    { id: 'cue-16', start: 142, end: 150, text: 'We are now witnessing the very first generation of stars illuminating the dark cosmos.', speaker: 'Cosmologist' },
    { id: 'cue-17', start: 150, end: 158, text: 'Beyond distant galaxies, Webb also scans planets orbiting distant stars, known as exoplanets.', speaker: 'Astrobiologist' },
    { id: 'cue-18', start: 158, end: 167, text: 'Using transmission spectroscopy, Webb analyzes starlight filtering through alien atmospheres as planets transit.', speaker: 'Astrobiologist' },
    { id: 'cue-19', start: 167, end: 174, text: 'It has already identified water vapor, carbon dioxide, sulfur dioxide, and potential atmospheric biosignatures.', speaker: 'Astrobiologist' },
    { id: 'cue-20', start: 174, end: 180, text: 'SceneSense will now assist you as you navigate, question, and test your understanding of this cosmic journey.', speaker: 'Narrator' }
  ]
};

export const SAMPLE_QUIZ: QuizQuestion[] = [
  {
    id: 'q-1',
    sceneId: 'scene-1',
    timestamp: 12,
    question: 'Why does the James Webb Space Telescope observe in the infrared spectrum rather than visible light?',
    options: [
      'Infrared cameras are much cheaper to build and launch into orbit',
      'Infrared light penetrates dense cosmic dust clouds that block visible light',
      'Visible light cannot travel through the vacuum of outer space',
      'The Earth’s atmosphere only allows infrared rays to escape'
    ],
    correctAnswer: 1,
    explanation: 'Cosmic dust blocks shorter wavelengths of visible light, but longer infrared wavelengths pass right through the dust particles.'
  },
  {
    id: 'q-2',
    sceneId: 'scene-2',
    timestamp: 55,
    question: 'Why are Webb’s 18 beryllium mirror segments coated with a microscopic layer of pure gold?',
    options: [
      'Gold is the most reflective material for infrared wavelengths of light',
      'Gold shields the telescope mirrors from solar radiation burns',
      'Gold prevents the mirrors from scratching during rocket launch vibration',
      'Gold makes the mirrors completely transparent to X-rays'
    ],
    correctAnswer: 0,
    explanation: 'Pure gold provides up to 98% reflectivity across the infrared spectrum, which is critical for capturing faint photons from distant stars.'
  },
  {
    id: 'q-3',
    sceneId: 'scene-3',
    timestamp: 85,
    question: 'How does Webb protect its scientific instruments from being blinded by its own heat?',
    options: [
      'By carrying thousands of gallons of liquid nitrogen in a tank',
      'By turning off its mirrors whenever it faces the sun',
      'By deploying a 5-layer Kapton sunshield that keeps the science side near -388°F',
      'By hiding on the dark side of Jupiter'
    ],
    correctAnswer: 2,
    explanation: 'The five-layer Kapton sunshield creates a massive 600°F temperature differential, keeping the instruments at cryogenic temperatures (-388°F).'
  },
  {
    id: 'q-4',
    sceneId: 'scene-4',
    timestamp: 125,
    question: 'What is cosmological redshift and why does it matter to Webb?',
    options: [
      'Redshift is an optical illusion caused by telescope lens refraction',
      'Light from the earliest stars stretched into infrared as the universe expanded',
      'Redshift happens when stars cool down and turn into red dwarves',
      "Redshift is the reflection of light bouncing off the Earth's atmosphere"
    ],
    correctAnswer: 1,
    explanation: 'As light travels across expanding space for 13.5 billion years, its wavelength stretches from visible/UV into the infrared spectrum.'
  },
  {
    id: 'q-5',
    sceneId: 'scene-5',
    timestamp: 158,
    question: 'How does Webb study the atmosphere of distant exoplanets?',
    options: [
      'By launching small robotic probes directly to the alien planets',
      'By taking high-resolution surface photos of alien oceans',
      'By using transmission spectroscopy to analyze starlight filtering through the atmosphere',
      'By listening for radio transmissions sent by alien civilizations'
    ],
    correctAnswer: 2,
    explanation: 'During a planetary transit, starlight shines through the planet’s atmosphere, leaving chemical absorption fingerprints (transmission spectroscopy).'
  }
];
