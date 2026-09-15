// All site content lives here. Edit this file, nothing else, to change what the room says.
// `slug` values appear in deep links (#experiences/kinetix) and inside the QR codes on the badges.

export const profile = {
  name: 'Abdallah Melhem',
  tagline: 'Quant research and machine learning',
  intro: 'Trained in Paris, tested on leaderboards.',
  bio: [
    "I started with two bachelor's degrees at once at the Lebanese University: telecommunication engineering in the top 1%, alongside computer science. Then Paris: general engineering at Mines Paris with a geostatistics and applied probability specialty, a statistics and learning master at Sorbonne, and now MASEF at Paris Dauphine, where the courses are stochastic calculus, market microstructure, order book models and high-frequency trading.",
    'I ran the IEEE student branch for a year and taught a twelve-session full-stack bootcamp.',
  ],
  emails: ['abdallah.melhem@dauphine.eu', 'abdallah.melhem@etu.minesparis.psl.eu'],
  github: 'https://github.com/AbdallahMelhem9',
  kaggle: 'https://www.kaggle.com/kenjimelhem',
  youtube: 'https://youtube.com/playlist?list=PLMl0tmOKM5rEBnAIkkfkDQyqiA67SwBQB',
  languages: [['English', 'C2'], ['Arabic', 'C2'], ['French', 'B2']],
  // Newest first. `short` is what the whiteboard writes.
  education: [
    { when: '2026 to 2027', what: 'Master of Mathematics, MASEF', where: 'Université Paris Dauphine, PSL', short: 'Dauphine' },
    { when: '2024 to 2025', what: 'Master of Mathematics, Statistics and Learning', where: 'Sorbonne University', short: 'Sorbonne' },
    { when: '2023 to 2026', what: 'General engineering, geostatistics and applied probability', where: 'École des Mines de Paris', short: 'Mines Paris' },
    { when: '2019 to 2023', what: "Dual bachelor's, telecommunication engineering and computer science", where: 'Lebanese University', short: 'Lebanese U.' },
  ],
};

// Newest first. On the wall they hang oldest to newest, left to right.
// `summary` is the one-paragraph story shown after the badge is scanned; `bullets` are the CV lines.
export const experiences = [
  {
    slug: 'debbas-markets', company: 'Debbas Markets', role: 'Quantitative research intern', when: 'Apr 2026 to Sep 2026', year: '2026', accent: '#4df3ff',
    summary: 'Six months of quant research on a small team: I built the data platform first, then used it to derive daily signals and backtest systematic strategies, and finished with machine learning models that make the allocation calls a discretionary portfolio manager would usually make by hand.',
    bullets: [
      'Built a PostgreSQL platform ingesting and validating prices, volatility surfaces, ETF flows and macro data daily.',
      'Derived daily market signals and backtested CTA, risk parity, volatility targeting and ETF-flow strategies.',
      'Built ML strategies forecasting US vs. world, cyclical vs. defensive and equity vs. bond calls for a portfolio.',
    ],
    skills: 'Python, PostgreSQL, LightGBM, XGBoost, riskfolio-lib, backtesting, time series',
  },
  {
    slug: 'kinetix', company: 'Kinetix', role: 'Generative AI R&D intern', when: 'Jul 2025 to Jan 2026', year: '2025', accent: '#9fb8ff',
    summary: 'Kinetix turns video of a person into 3D animation. I worked on the models that read human pose from video, in both regression and diffusion styles, with an emphasis on motion quality, training efficiency and disciplined experiments.',
    bullets: [
      'Developed video-to-animation human pose estimation networks, transformer based, in regression and diffusion styles.',
      'Built and integrated a hand pose estimation model for complex hand motion.',
      'Data augmentation and visualization for generated video.',
    ],
    skills: 'Video diffusion, PyTorch Lightning, DINOv3, ViTPose++, 3D HPE, OpenCV, CUDA, AWS, Flash Attention',
  },
  {
    slug: 'capital-fund-management', company: 'Capital Fund Management', role: 'Trading platform software engineering intern', when: 'May 2024 to Sep 2024', year: '2024', accent: '#3b82f6',
    summary: 'Internal trading infrastructure at a systematic hedge fund. The futures and options stack is a web of automated components, plug-ins and bridges; I built the display that shows how they connect, recovering the links from log files where they were not documented.',
    bullets: [
      'Created a display linking every trading component, automated processes, plug-ins and bridges, for futures and options.',
      'Parsed log files to map dependencies between plugin inputs and outputs across the options trading stack.',
    ],
    skills: 'Python, FastAPI, Angular, cloud, SQL',
  },
];

// `details` opens when a monitor is clicked. `live` is the deployed site, `video` the YouTube id of a demo; both optional.
export const projects = [
  { slug: 'ai-apply', year: 2026, title: 'AI Apply', stackShort: 'Python, Angular', stack: 'Python, FastAPI, Angular, Playwright, Claude',
    blurb: 'Sweeps hedge fund and bank job feeds every morning, scores each posting against your CV, drafts a cover letter with a two-agent pipeline, and fills the form. It stops before Submit.',
    details: 'Every morning it fetches openings from the career pages of the firms you follow, detects the applicant tracking system behind each one, and filters the roles. A first agent drafts a cover letter from your CV and a prototype letter; a second agent critiques it. Playwright then fills the application form and stops on the last page, so the final click is always yours. Friends use it too: each user has their own space and login.',
    url: null, live: 'https://ai-applier.onrender.com', video: null },
  { slug: 'semantic-market-prediction', year: 2026, title: 'Semantic Market Prediction', stackShort: 'Python, XGBoost', stack: 'Python, XGBoost, GPT and Claude ensemble, NewsAPI, Finnhub',
    blurb: 'Scores recession fear in financial news with an LLM ensemble, tracks it against the S&P 500 and Euro Stoxx 50, and predicts next-day direction. Built for the BNP Paribas equity and derivatives strategy team.',
    details: 'News comes from three sources and is cleaned before any model sees it. Two language models read each day\'s articles and give one fear score for the day, weighing a single major event above many routine ones; averaging the two models reduces model-specific bias. An XGBoost model trained on two years of VIX and index data turns the fear series into a next-day direction, shown side by side with a written forecast from the language model. Each day only ever sees data from previous days, so the backtest is honest.',
    url: 'https://github.com/AbdallahMelhem9/Semantic-Market-Prediction', live: 'https://semantic-market-prediction.onrender.com', video: null,
    shots: [
      { src: 'demos/semantic-market-prediction/1.jpg', caption: "The dashboard: a fear index read from the news, and tomorrow's call from two models." },
      { src: 'demos/semantic-market-prediction/2.jpg', caption: "Recession fear in the news against the S&P 500, day by day." },
      { src: 'demos/semantic-market-prediction/3.jpg', caption: "The same for Europe, against the Euro Stoxx 50." },
      { src: 'demos/semantic-market-prediction/4.jpg', caption: "Filter by sector: the index and the chart follow that sector's ETF instead." },
      { src: 'demos/semantic-market-prediction/5.jpg', caption: "Sector by sector, day by day: where the fear sits." },
      { src: 'demos/semantic-market-prediction/6.jpg', caption: "Every article with its score, sector and the model's reasoning." },
    ] },
  { slug: 'masef-helper', year: 2026, title: 'MASEF Helper', stackShort: 'Angular, Node', stack: 'Angular 20, Node, Express, SQLite, Claude Agent SDK',
    blurb: 'A study app that turns course PDFs into readable LaTeX sections, each with an AI lecture and its own chat. A PDF you can talk to.',
    details: 'Courses hold lessons, lessons hold the teacher\'s PDFs. Uploading a PDF outlines it into sections, transcribes each section faithfully to Markdown and LaTeX, and writes a short lecture under it. Every section has its own chat box, and there is a glossary and several reading modes. Built for my own MASEF year at Dauphine.',
    url: 'https://github.com/AbdallahMelhem9/masef-helper', live: 'https://masef-helper.onrender.com', video: null,
    shots: [
      { src: 'demos/masef-helper/1.jpg', caption: "Courses, lessons, and the teacher's PDFs behind them." },
      { src: 'demos/masef-helper/2.jpg', caption: "A course: one lesson per chapter, each with its PDF." },
      { src: 'demos/masef-helper/3.jpg', caption: "A PDF you can read with explanations, notes and your own questions." },
    ] },
  { slug: 'deep-learning-papers', year: 2025, title: 'Deep learning papers, rebuilt', stackShort: 'PyTorch', stack: 'PyTorch, Jupyter, YouTube',
    blurb: 'PyTorch re-implementations of DDPM, U-Net, VAE and a mini GPT, as runnable notebooks with accompanying videos.',
    details: 'Each paper gets a notebook that rebuilds the model from scratch and a video that walks through the paper and the code, including the maths. The videos sit on the rack below the monitors.',
    url: 'https://github.com/AbdallahMelhem9/Machine_learning_papers', live: null, video: null, playlist: true },
  { slug: 'console-chess', year: 2025, title: 'Console chess', stackShort: 'C++', stack: 'C++, CMake',
    blurb: 'A chess engine with algebraic move input, check, checkmate and stalemate detection, and saved games you can replay.',
    details: 'A board class executes moves and checks for check, checkmate and stalemate; each piece type has its own class for legal moves. Games are saved as JSON and can be replayed from the menu. Builds with CMake on Linux and Visual Studio on Windows.',
    url: 'https://github.com/AbdallahMelhem9/Chess_CPP', live: null, video: null },
  { slug: 'crousteam', year: 2024, title: 'Crousteam', stackShort: 'React Native, Flask', stack: 'React Native, Flask, PostgreSQL',
    blurb: 'A mobile app that matches people on shared interests, with messaging and real-life events that carry their own group chat. Built with three classmates at Mines Paris.',
    details: 'You fill in your interests and get matched with people who share them, message your matches, and create or join real-life events, from a chess game at a café to watching a match, each with its own keywords and group chat. Flask and PostgreSQL on the back end, React Native on the front.',
    url: 'https://github.com/AbdallahMelhem9/Crousteam', live: null, video: null },
  { slug: 'vr-drawing', year: 2024, title: 'VR drawing', stackShort: 'Unity, C#', stack: 'Unity, C#, HLSL',
    blurb: 'Draw in the air with a 3D brush or place voxels, then save and record the piece. Runs on the Meta Quest 2.',
    details: 'Two ways to draw: a free 3D brush with ink, or voxels placed block by block. Drawings can be saved and the session recorded. Written in Unity with custom shaders for the brush strokes.',
    url: 'https://github.com/AbdallahMelhem9/VR-Drawing-Project', live: null, video: null },
];

// The rack below the project monitors. Newest last, so the rack reads left to right in order.
export const videos = [
  { id: '3uvQWd7Lh3g', date: '2025-09', title: 'U-Net paper, full explanation and implementation' },
  { id: 'BBgwgQImoFo', date: '2025-09', title: 'Variational autoencoders, detailed explanation' },
  { id: '0twPtHh6GH4', date: '2025-10', title: 'Variational autoencoders, implementation with code' },
  { id: '5db39NGwu3o', date: '2025-11', title: 'Attention is all you need, the Transformer explained with the maths' },
  { id: 'feejNlP38T0', date: '2025-11', title: 'Transformers implementation, a personalized ChatGPT from scratch' },
  { id: '5ijjokPskKw', date: '2025-12', title: 'Introduction to deep learning, explanation, code and a numeric example' },
  { id: 'qmP7-wPioWM', date: '2026-07', title: 'How diffusion models turn noise into images, DDPM paper explained' },
  { id: 'TgTQE_muXec', date: '2026-08', title: 'Coding a diffusion model from scratch in PyTorch' },
];

// Ranked results, finance first, then machine learning. `medal` colors the rank on the screen and in the panel. Ranks come from the Kaggle profile (kaggle.com/kenjimelhem) where the
// competition is on Kaggle, otherwise from the organizer's leaderboard. The 3D screen shows the first `onScreen`;
// the panel lists them all. `short` is what the results tape on the desk scrolls. `what` and `approach` open on click.
// `url` is the code; `page` is the competition page.
export const competitions = {
  onScreen: 8,
  // The three medals on the wall, in order: gold, silver, bronze.
  podium: ['qube-rt-asset-allocation', 'hedge-fund-time-series', 'imc-prosperity-4'],
  ranked: [
    { slug: 'qube-rt-asset-allocation', medal: 'gold', name: 'Asset allocation performance forecasting', host: 'Qube RT', rank: 7, of: 1280, short: 'QUBE RT',
      note: 'Predict whether a portfolio allocation goes up or down tomorrow, from twenty days of returns and volumes.',
      what: 'A Qube Research & Technologies challenge on the ENS Challenge Data platform. Each row is one allocation on an anonymized date, with twenty days of returns and signed volume, a median daily turnover and a group label. The target is the sign of the next-day return; the metric is accuracy.',
      approach: 'LightGBM, depth 3, on hand-crafted features: average performance over several windows with per-date means and volatility, RSI, momentum ratio and streaks, skewness and kurtosis, drawdown, z-score, rank and group mean within the date, volume-weighted returns and turnover interactions. Validation with eight folds over dates rather than rows, so a fold never sees the other allocations of its own date. The lesson was the gap between validation and leaderboard: features built from one row or one date generalized, features that used an allocation\'s own history across dates raised validation but not the leaderboard, so they were dropped.',
      page: 'https://challengedata.ens.fr/participants/challenges/167/', url: null, codeNote: 'The challenge is still running, so the code stays private until it closes.' },
    { slug: 'imc-prosperity-4', medal: 'bronze', name: 'IMC Prosperity 4', host: 'IMC Trading', rank: 153, of: 18803, short: 'IMC P4',
      note: 'Write a trading bot for a simulated exchange. 4th of 145 in France.',
      what: 'IMC Trading\'s global algorithmic trading competition. Over five rounds, teams submit a Python Trader class that receives the order book of a simulated exchange at each tick and returns orders under position limits, with manual trading rounds alongside. Over 18,000 teams took part.',
      approach: 'I played rounds 1, 2 and 5; exams took rounds 3 and 4. Rounds 1 and 2: mean reversion around a 10,000 anchor on one product, with takes gated by a small regression model, and a trend fair value on the other. Round 5, where most of the profit came from: basket arbitrage on five products against their known sum, two pairs traded around their mean with entry and exit bands, and mean reversion on four products that only trades when recent moves show negative autocorrelation, sized to the position limit after a sweep of about fifty backtested variants.',
      page: null, url: 'https://github.com/AbdallahMelhem9/imc-prosperity-4' },
    { slug: 'hedge-fund-time-series', medal: 'silver', name: 'Hedge fund time series forecasting', host: 'Kaggle', rank: 15, of: 983, short: 'KAGGLE TS',
      note: 'Forecast thousands of series one to twenty-five steps ahead, without peeking at the future.',
      what: 'A Kaggle community competition on a 5.3-million-row anonymized panel: forecast a target one, three, ten and twenty-five steps ahead for thousands of series, scored on a weighted R-squared style metric.',
      approach: 'One LightGBM per horizon on a time-based holdout. Feature families: group means and deltas within a series, cross-sectional ranks within a time step, long lags, rolling means and exponential averages, and target encodings of the ids, with a different feature map per horizon. CatBoost with categorical ids for the 25-step horizon, blended with per-category expert models. A broad feature search gave the main jump; after the organizers clarified the rule on target-derived features, causal-safe variants replaced full-series statistics with expanding ones.',
      page: 'https://www.kaggle.com/competitions/ts-forecasting', url: 'https://github.com/AbdallahMelhem9/kaggle-hedge-fund-time-series' },
    { slug: 'murex-cmf-brainteasers', medal: 'silver', name: 'Murex x CMF brainteasers', host: 'Murex, CMF', rank: 5, of: 150, short: 'MUREX CMF',
      note: 'Timed quantitative puzzles, the kind asked in quant interviews.',
      what: 'A timed brainteaser contest run by Murex with CMF: probability, combinatorics, mental arithmetic and market-style reasoning, the kind of questions asked in quant interviews.',
      approach: 'No code, just paper and speed. 5th of 150.',
      page: null, url: null, codeNote: 'Pen-and-paper contest, so there is no code.' },
    { slug: 'student-test-scores', medal: 'silver', name: 'Predicting student test scores', host: 'Kaggle Playground Series', rank: 17, of: 4317, short: 'KAGGLE PS',
      note: 'Predict students\' exam scores from their study habits and background.',
      what: 'Kaggle Playground Series, season 6 episode 1: predict students\' exam scores from study habits, attendance and background features on a synthetic dataset, scored by root mean squared error.',
      approach: 'An ensemble of 102 XGBoost models, gated by a categorical model that decides which members to trust for each row. 17th of 4,317 on the final leaderboard.',
      page: 'https://www.kaggle.com/competitions/playground-series-s6e1', url: null, codeNote: 'Built in Kaggle notebooks; not on GitHub yet.' },
    { slug: 'stellar-class', medal: 'silver', name: 'Predicting stellar class', host: 'Kaggle Playground Series', rank: 23, of: 2816, short: 'KAGGLE S6E6',
      note: 'Tell galaxies, quasars and stars apart from telescope measurements.',
      what: 'Kaggle Playground Series, season 6 episode 6: classify sky objects as galaxy, quasar or star from photometric measurements, on synthetic data modeled on the Sloan Digital Sky Survey, scored by balanced accuracy.',
      approach: 'A blend of gradient-boosted models (XGBoost, CatBoost, LightGBM) and a small neural network over the raw magnitudes, their colour differences and redshift, with out-of-fold blending and a check that every gain in cross-validation also moved the leaderboard. Balanced accuracy 0.971; 23rd of 2,816.',
      page: 'https://www.kaggle.com/competitions/playground-series-s6e6', url: 'https://github.com/AbdallahMelhem9/kaggle-stellar-class' },
    { slug: 'handwritten-to-data', medal: 'silver', name: 'Handwritten to data', host: 'Kaggle', rank: 16, of: 198, short: 'HANDWRITING',
      note: 'Read Ukrainian handwritten documents and turn them into text.',
      what: 'A Kaggle community competition on recognizing Ukrainian handwritten documents: transcribe scanned handwriting, including formulas and tables, into text, scored by how close the transcription is to the ground truth.',
      approach: 'Detect the text regions first, then transcribe each one with transformer OCR models fine-tuned on the competition\'s handwriting (TrOCR, with QLoRA adapters on larger vision-language models), and correct the Ukrainian text afterwards with a language model. 16th of 198.',
      page: 'https://www.kaggle.com/competitions/handwritten-to-data', url: 'https://github.com/AbdallahMelhem9/kaggle-handwritten-to-data' },
    { slug: 'supertuxkart-rl', medal: 'silver', name: 'SuperTuxKart reinforcement learning', host: 'Sorbonne University', rank: 2, of: 21, short: 'STK RL',
      note: 'Teach an agent to race a kart, by trial and error. 2nd of 21 in the class.',
      what: 'A Sorbonne University reinforcement learning project with a class leaderboard: train an agent to race in SuperTuxKart through PySTK2 and Gymnasium, using the BBRL library.',
      approach: 'Parallel environments for throughput. A custom DQN that collapses the 1,120-action space into 56 composite actions, and a hybrid SAC with a shared MLP encoder for joint continuous and discrete control. Best reward 432.2, 2nd of 21.',
      page: null, url: null, codeNote: 'Course project; the code is not published.' },
  ],
  // Entered without a top result, or still running.
  entered: [
    { name: 'Stanford RNA 3D folding, part 2', host: 'Kaggle', note: 'Predict the 3D shape of an RNA molecule from its sequence. Finished 296th of 1,867.' },
    { name: 'Orbit Wars', host: 'Kaggle', note: 'Real-time bot battles for planets orbiting a sun. Finished 846th of 4,729.', url: 'https://github.com/AbdallahMelhem9/kaggle-orbit-wars' },
    { name: 'Predicting student health risk', host: 'Kaggle Playground Series', note: 'Playground S6E7, balanced accuracy about 0.95 in cross-validation. Finished 604th of 3,355.', url: 'https://github.com/AbdallahMelhem9/kaggle-student-health-risk' },
    { name: 'Biohub cell tracking during development', host: 'Kaggle', note: 'Cell lineage tracking in microscopy. Still running.' },
    { name: 'The 2026 NeuroGolf championship', host: 'Kaggle', note: 'Smallest neural networks that solve ARC-AGI transformations. Finished 1,313th of 2,963.', url: 'https://github.com/AbdallahMelhem9/kaggle-neurogolf' },
    { name: 'ROGII wellbore geology prediction', host: 'Kaggle', note: 'Physics-informed ridge and gradient boosting. Finished 3,889th of 6,125.', url: 'https://github.com/AbdallahMelhem9/kaggle-rogii-wellbore' },
    { name: 'Liquidity Arena 2026', host: 'Kaggle', note: 'AI quant trading competition.' },
    { name: 'March Machine Learning Mania 2026', host: 'Kaggle', note: 'Calibrated XGBoost and rating models, Brier score.' },
    { name: 'Soccer feature engineering hackathon', host: 'SkillCorner', note: '25 team-level features from SkillCorner dynamic events.' },
    { name: 'Leukemia risk prediction', host: 'Qube RT', note: 'Survival analysis, Cox models with molecular features, 2025.' },
  ],
};

export const topPercent = (rank, of) => (100 * rank) / of;
