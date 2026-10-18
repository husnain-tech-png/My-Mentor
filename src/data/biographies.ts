import { Biography } from '../types';

export const BIOGRAPHIES: Biography[] = [
  {
    id: 'abdur-rahman-bin-auf',
    name: 'Abdur Rahman bin Auf',
    shortBio: 'One of the early companions of the Prophet Muhammad (pbuh), legendary merchant, and ethical philanthropist.',
    context: '7th Century Arabia · Commerce, Trade & Ethical Wealth',
    topicTags: ['ethics', 'trade', 'resilience', 'generosity', 'leadership'],
    lastVerified: '2026-09-15',
    reviewStatus: 'reviewed',
    sources: [
      {
        title: 'Siyar A‘lam al-Nubala by Al-Dhahabi (Vol. 1)',
        url: 'https://sunnah.com',
        author: 'Imam Shams al-Din al-Dhahabi',
        date: '1348 CE',
        sourceType: 'hadith',
        accessDate: '2026-09-15',
        rights: 'Public Domain Classical Text'
      },
      {
        title: 'Sahih al-Bukhari, Book of Sales and Trade (Kitab al-Buyu‘), Hadith 2048',
        url: 'https://sunnah.com/bukhari:2048',
        author: 'Muhammad al-Bukhari',
        date: '846 CE',
        sourceType: 'hadith',
        accessDate: '2026-09-15',
        rights: 'Open Reference'
      }
    ],
    lessons: [
      {
        id: 'lesson-ar-1',
        title: 'The "Show Me the Market" Principle (Dullani ‘ala al-suq)',
        verifiedFact: 'Upon migrating to Madinah penniless after leaving his wealth behind in Makkah, his host Sa‘d ibn al-Rabi‘ offered him half his estate and wealth. Abdur Rahman declined the handout with gratitude, saying: "May Allah bless you in your family and wealth; show me where the market is."',
        attributedInterpretation: 'Self-reliance, immediate bias to action, and confidence in one\'s competence create durable dignity, whereas dependency undermines long-term agency.',
        suggestedLesson: 'When facing dislocation, career restart, or zero capital, focus on where value is exchanged. Start with market discovery and small transactions rather than waiting for external bailouts.',
        topicTags: ['resilience', 'startup-basics', 'trade'],
        sourceRefs: ['0', '1'],
        relevanceExplanation: 'Crucial for early founders, immigrants, or job-seekers needing to build momentum from scratch without waiting for ideal conditions.'
      },
      {
        id: 'lesson-ar-2',
        title: 'High-Volume, Low-Margin, Spot Settlement',
        verifiedFact: 'Classical records note Abdur Rahman built his initial trading volume in Madinah on horses, butter, and dried yogurt, refusing speculative credit, selling for spot cash, and taking small margins per unit.',
        attributedInterpretation: 'Liquidity, rapid turnover, and zero deceptive practices outperform greedy windfalls and minimize bankruptcy risk.',
        suggestedLesson: 'Prioritize cash flow velocity and customer trust over maximal single-sale margins, especially in early ventures.',
        topicTags: ['trade', 'startup-basics', 'investor-literacy'],
        sourceRefs: ['0'],
        relevanceExplanation: 'Helps entrepreneurs avoid the common trap of excessive pricing and overextended receivables.'
      },
      {
        id: 'lesson-ar-3',
        title: 'Stewardship Over Hoarding (Circulating Wealth)',
        verifiedFact: 'In times of drought and community distress, Abdur Rahman financed entire caravans of food and provisions, and emancipated dozens of enslaved individuals, bequeathing massive shares to veterans and vulnerable widows.',
        attributedInterpretation: 'Wealth was perceived not as a private fortress, but as an energetic trust to be productively deployed for public utility.',
        suggestedLesson: 'Frame your financial success around positive externalities. A mentor keeps you grounded in community impact rather than vanity metrics.',
        topicTags: ['ethics', 'generosity', 'leadership'],
        sourceRefs: ['0'],
        relevanceExplanation: 'Grounds aspiring leaders in ethical responsibility and sustainable purpose.'
      }
    ],
    caveats: [
      'He operated in a pre-industrial mercantile economy; modern capital structures and regulatory burdens require institutional adaptation.',
      'His success was intertwined with a network of high-trust communal bonds in Madinah.'
    ]
  },
  {
    id: 'fatima-al-fihri',
    name: 'Fatima al-Fihri',
    shortBio: 'Founder of the University of al-Qarawiyyin in Fez, Morocco (859 CE) — recognized as the oldest continuously operating university in the world.',
    context: '9th Century Morocco · Enduring Institutions, Waqf & Education',
    topicTags: ['education', 'leadership', 'institution-building', 'legacy'],
    lastVerified: '2026-09-10',
    reviewStatus: 'reviewed',
    sources: [
      {
        title: 'Rawd al-Qirtas',
        url: 'https://en.unesco.org/silkroad/content/al-qarawiyyin-university',
        author: 'Ibn Abi Zar',
        date: '1326 CE',
        sourceType: 'book',
        accessDate: '2026-09-10',
        rights: 'UNESCO World Heritage Archive'
      }
    ],
    lessons: [
      {
        id: 'lesson-faf-1',
        title: 'The Perpetual Endowment (Waqf) Model',
        verifiedFact: 'Fatima inherited a substantial fortune from her merchant father. Rather than consuming it or dispersing it in temporary charity, she invested the entire corpus to build a mosque, library, and center of learning that has sustained itself for over 1,100 years.',
        attributedInterpretation: 'Designing self-sustaining institutional architecture leaves exponentially greater impact than one-off philanthropic spending.',
        suggestedLesson: 'When building products, companies, or initiatives, structure sustainable economic flywheels that outlive your direct supervision.',
        topicTags: ['institution-building', 'legacy', 'product-skills'],
        sourceRefs: ['0'],
        relevanceExplanation: 'Teaches students and founders to think in multi-decade horizons.'
      },
      {
        id: 'lesson-faf-2',
        title: 'Personal Consecration and Deep Focus',
        verifiedFact: 'Historical accounts record that Fatima personally oversaw the construction and fasted daily throughout the groundbreaking and construction until completion.',
        attributedInterpretation: 'High personal discipline and moral alignment infuse a project with legitimacy and resilient team alignment.',
        suggestedLesson: 'Anchor your most demanding projects in personal discipline and integrity, not mere managerial delegation.',
        topicTags: ['leadership', 'ethics'],
        sourceRefs: ['0']
      }
    ],
    caveats: [
      'Biographical records from 9th century Fez are scarce and mediated through 14th century chroniclers like Ibn Abi Zar.',
      'Sustaining the university over centuries also relied on generations of subsequent state and civic custodians.'
    ]
  },
  {
    id: 'warren-buffett',
    name: 'Warren Buffett',
    shortBio: 'Chairman and CEO of Berkshire Hathaway, one of the most successful investors and capital allocators in modern financial history.',
    context: '20th–21st Century USA · Capital Allocation, Mental Models & Compounding',
    topicTags: ['investor-literacy', 'patience', 'discipline', 'leadership'],
    lastVerified: '2026-09-20',
    reviewStatus: 'reviewed',
    sources: [
      {
        title: 'Berkshire Hathaway Annual Shareholder Letters (1977–2024)',
        url: 'https://www.berkshirehathaway.com/letters/letters.html',
        author: 'Warren E. Buffett',
        date: '2024',
        sourceType: 'shareholder-letter',
        accessDate: '2026-09-20',
        rights: 'Public Corporate Archive'
      },
      {
        title: 'The Snowball: Warren Buffett and the Business of Life',
        url: 'https://www.simonandschuster.com/books/The-Snowball/Alice-Schroeder/9781408807316',
        author: 'Alice Schroeder',
        date: '2008',
        sourceType: 'book',
        accessDate: '2026-09-20',
        rights: 'Copyrighted Reference'
      }
    ],
    lessons: [
      {
        id: 'lesson-wb-1',
        title: 'The Circle of Competence',
        verifiedFact: 'Buffett famously avoided investing in high-flying dot-com stocks in 1999–2000, explicitly stating he did not understand their unit economics or terminal moats, enduring severe public criticism before the bubble burst.',
        attributedInterpretation: 'Knowing what you do not know is far more protective and profitable than trying to know everything.',
        suggestedLesson: 'Define your boundaries clearly. Double down on domains where you possess authentic informational or operational advantages.',
        topicTags: ['investor-literacy', 'discipline', 'startup-basics'],
        sourceRefs: ['0', '1'],
        relevanceExplanation: 'Prevents founders and career professionals from succumbing to FOMO and spreading themselves too thin.'
      },
      {
        id: 'lesson-wb-2',
        title: 'Patience and the Inevitability of Compounding',
        verifiedFact: 'Over 95% of Warren Buffett\'s net worth was accumulated after his 60th birthday. His primary advantage has been uninterrupted compounding over seven decades.',
        attributedInterpretation: 'Durability, avoiding catastrophic downside (Rule #1: Never lose money), and longevity outperform volatile brilliance.',
        suggestedLesson: 'In career and learning, prioritize habits and systems that you can sustain for 20+ years without burning out.',
        topicTags: ['patience', 'investor-literacy', 'habits'],
        sourceRefs: ['0', '1']
      }
    ],
    caveats: [
      'Buffett operated during an extraordinary period of American postwar economic expansion and favorable insurance float dynamics.',
      'Extreme frugality in personal relationships in his early decades is noted as a personal trade-off.'
    ]
  },
  {
    id: 'steve-jobs',
    name: 'Steve Jobs',
    shortBio: 'Co-founder of Apple Inc. and Pixar, pioneer of the personal computer, mobile, and digital music revolutions.',
    context: '20th–21st Century Silicon Valley · Product Design, Taste & Simplification',
    topicTags: ['product-skills', 'leadership', 'startup-basics', 'craft'],
    lastVerified: '2026-09-18',
    reviewStatus: 'reviewed',
    sources: [
      {
        title: 'Steve Jobs',
        url: 'https://www.simonandschuster.com/books/Steve-Jobs/Walter-Isaacson/9781451648539',
        author: 'Walter Isaacson',
        date: '2011',
        sourceType: 'book',
        accessDate: '2026-09-18',
        rights: 'Published Biography'
      },
      {
        title: 'Stanford University Commencement Address',
        url: 'https://news.stanford.edu/stories/2005/06/youve-got-find-what-love-jobs-says-2005',
        author: 'Steve Jobs',
        date: '2005-06-12',
        sourceType: 'article',
        accessDate: '2026-09-18',
        rights: 'Public Address'
      }
    ],
    lessons: [
      {
        id: 'lesson-sj-1',
        title: 'Radical Focus and Saying "No" to 1,000 Good Ideas',
        verifiedFact: 'Upon returning to Apple in 1997 with the company 90 days from bankruptcy, Jobs slashed dozens of product lines down to a simple 2x2 grid: Desktop vs Portable, Consumer vs Pro.',
        attributedInterpretation: 'Clarity of purpose requires the courage to discard profitable distractions to allow a masterpiece to breathe.',
        suggestedLesson: 'Identify your 1-2 core priorities each quarter and deliberately refuse the rest.',
        topicTags: ['product-skills', 'leadership'],
        sourceRefs: ['0', '1'],
        relevanceExplanation: 'Essential for students juggling too many extracurriculars and founders drowning in feature creep.'
      },
      {
        id: 'lesson-sj-2',
        title: 'Intersection of Technology and Liberal Arts',
        verifiedFact: 'Apple\'s hallmark differentiation came from typography classes Jobs dropped into at Reed College, calligraphy, industrial design, and emotional resonance rather than raw hardware specifications.',
        attributedInterpretation: 'Deep technical capability paired with humanistic empathy creates irresistible products.',
        suggestedLesson: 'Cultivate interdisciplinary curiosity. Combine hard technical mastery with psychology, writing, and design.',
        topicTags: ['craft', 'product-skills', 'education'],
        sourceRefs: ['0', '1']
      }
    ],
    caveats: [
      'His management style could be intensely abrasive and unrepeatable without severe relational damage.',
      'His intuition was balanced by brilliant operational executioners like Tim Cook and design visionaries like Jony Ive.'
    ]
  },
  {
    id: 'marie-curie',
    name: 'Marie Curie',
    shortBio: 'Two-time Nobel laureate in Physics and Chemistry; discoverer of polonium and radium; pioneer in radiation research.',
    context: 'Late 19th – Early 20th Century France/Poland · Science, Rigor & Persistence',
    topicTags: ['resilience', 'education', 'discipline', 'ethics'],
    lastVerified: '2026-09-12',
    reviewStatus: 'reviewed',
    sources: [
      {
        title: 'Madame Curie: A Biography',
        url: 'https://www.nobelprize.org/prizes/physics/1903/marie-curie/biographical/',
        author: 'Ève Curie',
        date: '1937',
        sourceType: 'book',
        accessDate: '2026-09-12',
        rights: 'Nobel Foundation & Historical Biography'
      }
    ],
    lessons: [
      {
        id: 'lesson-mc-1',
        title: 'Unyielding Methodological Rigor Through Drudgery',
        verifiedFact: 'Curie and Pierre processed metric tons of pitchblende ore by hand in a drafty, unheated shed over four arduous years to isolate a fraction of a gram of radium.',
        attributedInterpretation: 'Breakthrough discoveries are built on countless hours of unglamorous, repetitive foundational work that others abandon.',
        suggestedLesson: 'Do not mistake routine effort for lack of progress. High-craft breakthroughs demand sustained labor through the plateau of latent potential.',
        topicTags: ['discipline', 'resilience', 'education'],
        sourceRefs: ['0'],
        relevanceExplanation: 'Inspires students writing theses, engineers debugging complex systems, and researchers in slow-feedback environments.'
      },
      {
        id: 'lesson-mc-2',
        title: 'Commitment to Open Scientific Knowledge',
        verifiedFact: 'Curie deliberately refused to patent the radium-isolation process, allowing scientists worldwide to research its medical and physical properties without licensing friction.',
        attributedInterpretation: 'Belief in the universal democratization of knowledge over short-term monopoly rents.',
        suggestedLesson: 'Consider where open sharing generates compounding goodwill, collaboration, and advancement for all.',
        topicTags: ['ethics', 'legacy'],
        sourceRefs: ['0']
      }
    ],
    caveats: [
      'Lack of knowledge about radiation safety in her era led to chronic radiation sickness that eventually claimed her life.',
      'Extreme self-sacrifice without personal health safeguards is a cautionary note rather than an emulation goal.'
    ]
  },
  {
    id: 'ibn-battuta',
    name: 'Ibn Battuta',
    shortBio: '14th-century Moroccan scholar and jurist who journeyed over 73,000 miles across Africa, the Middle East, South Asia, China, and Southeast Asia.',
    context: '14th Century Islamic World & Beyond · Adaptability, Curiosity & Legal Scholarship',
    topicTags: ['adaptability', 'cultural-literacy', 'curiosity', 'resilience'],
    lastVerified: '2026-09-14',
    reviewStatus: 'reviewed',
    sources: [
      {
        title: 'The Rihla (A Masterpiece to Those Who Contemplate the Wonders of Cities and the Marvels of Travelling)',
        url: 'https://en.unesco.org/silkroad/content/ibn-battuta',
        author: 'Ibn Battuta (dictated to Ibn Juzayy)',
        date: '1355 CE',
        sourceType: 'book',
        accessDate: '2026-09-14',
        rights: 'Public Domain Classical Text'
      }
    ],
    lessons: [
      {
        id: 'lesson-ib-1',
        title: 'Portable Skills and Institutional Interoperability',
        verifiedFact: 'As a trained Maliki legal jurist (qadi), Ibn Battuta was able to secure appointments, lodging, and governmental employment in the Maldives, Delhi Sultanate, and North Africa despite language differences.',
        attributedInterpretation: 'Possessing a globally transferable, deeply understood competency gives you mobility and leverage across any geography or economic climate.',
        suggestedLesson: 'Invest in portable fundamentals (coding, quantitative analysis, contract law, clear writing) that operate reliably across industries and borders.',
        topicTags: ['education', 'adaptability', 'startup-basics'],
        sourceRefs: ['0'],
        relevanceExplanation: 'Helps students and remote workers identify skills that withstand economic and geographic shifts.'
      }
    ],
    caveats: [
      'Some descriptions in the later parts of his travels (e.g., China) were likely embellished or augmented by the scribe Ibn Juzayy.'
    ]
  }
];
