/* ============================================
   AI ROBOT ODYSSEY — Mission / Station Data
   ============================================ */

const MISSIONS = [
  {
    id: 1,
    key: 'generative',
    titleEn: 'GENERATIVE AI',
    titleZh: '生成式人工智慧',
    shortDesc: 'Teach a machine to generate.',
    fullDesc: 'Learn how models transform prompts into text, images and more. From tokens to transformers — the foundation of modern AI.',
    mission: 'Teach a machine to generate.',
    topics: [
      'What is Generative AI?',
      'Large Language Models',
      'Transformers',
      'Tokens',
      'Embeddings',
      'Prompt Engineering',
      'Text Generation',
      'Image Generation'
    ],
    icon: '◈',
    color: 'violet',
    x: 280,
    y: 380,
    labType: 'prompt'
  },
  {
    id: 2,
    key: 'multimodal',
    titleEn: 'MULTIMODAL AI',
    titleZh: '多模態人工智慧',
    shortDesc: 'Give AI eyes and ears.',
    fullDesc: 'Combine text, image, audio and video. Vision-language models let AI understand the world through multiple senses.',
    mission: 'Give AI eyes and ears.',
    topics: [
      'Text · Image · Audio · Video',
      'Vision-Language Models',
      'Speech-to-Text',
      'Text-to-Speech',
      'Cross-modal Alignment'
    ],
    icon: '◉',
    color: 'violet',
    x: 620,
    y: 280,
    labType: 'multimodal'
  },
  {
    id: 3,
    key: 'agents',
    titleEn: 'AI AGENTS',
    titleZh: 'AI 智慧代理人',
    shortDesc: 'Turn an AI model into an agent.',
    fullDesc: 'From passive models to active agents: reasoning, tool calling, memory, planning and multi-agent systems.',
    mission: 'Turn an AI model into an agent.',
    topics: [
      'AI Agent',
      'Tool Calling',
      'Function Calling',
      'Memory',
      'Planning',
      'MCP · Skills',
      'Multi-Agent Systems'
    ],
    icon: '⬡',
    color: 'violet',
    x: 980,
    y: 420,
    labType: 'agent'
  },
  {
    id: 4,
    key: 'vision',
    titleEn: 'COMPUTER VISION',
    titleZh: '電腦視覺',
    shortDesc: 'Teach the robot to see.',
    fullDesc: 'Teach machines to understand images: classification, detection, segmentation, pose and depth estimation.',
    mission: 'Teach the robot to recognize three objects.',
    topics: [
      'Image Classification',
      'Object Detection',
      'YOLO',
      'Segmentation',
      'Pose Estimation',
      'Depth Estimation',
      'Visual Tracking'
    ],
    icon: '◎',
    color: 'cyan',
    x: 1280,
    y: 320,
    labType: 'vision'
  },
  {
    id: 5,
    key: 'sensors',
    titleEn: 'ROBOT SENSORS',
    titleZh: '機器人感知',
    shortDesc: 'Help the robot understand its environment.',
    fullDesc: 'Sensors feed perception. Camera, IMU, LiDAR, ultrasonic and encoders build the robot\'s world model.',
    mission: 'Help the robot understand its environment.',
    topics: [
      'Camera · Microphone',
      'IMU · Accelerometer · Gyro',
      'Ultrasonic · LiDAR',
      'Wheel Encoder · GPS',
      'Sensors → Perception → World Model'
    ],
    icon: '⊛',
    color: 'cyan',
    x: 1580,
    y: 480,
    labType: 'sensors'
  },
  {
    id: 6,
    key: 'control',
    titleEn: 'ROBOT CONTROL',
    titleZh: '機器人控制',
    shortDesc: 'Turn AI decisions into physical motion.',
    fullDesc: 'Motors, servos, PWM, PID and kinematics. Convert decisions into coordinated physical movement.',
    mission: 'Turn AI decisions into physical motion.',
    topics: [
      'Motors · Servos · PWM',
      'Motor Drivers',
      'PID Control',
      'Forward / Inverse Kinematics',
      'Differential Drive'
    ],
    icon: '⚙',
    color: 'cyan',
    x: 1880,
    y: 360,
    labType: 'control'
  },
  {
    id: 7,
    key: 'embodied',
    titleEn: 'EMBODIED AI',
    titleZh: '具身人工智慧',
    shortDesc: 'Move intelligence into the physical world.',
    fullDesc: 'Intelligence that interacts with the physical world: spatial reasoning, navigation, manipulation and world models.',
    mission: 'Move intelligence from the screen into the physical world.',
    topics: [
      'Embodied Intelligence',
      'Spatial Reasoning',
      'Navigation · Manipulation',
      'World Models',
      'Reinforcement Learning',
      'Sim-to-Real'
    ],
    icon: '◈',
    color: 'cyan',
    x: 2180,
    y: 500,
    labType: 'embodied'
  },
  {
    id: 8,
    key: 'vla',
    titleEn: 'VISION-LANGUAGE-ACTION',
    titleZh: 'VLA 模型',
    shortDesc: 'Connect language, vision and physical action.',
    fullDesc: 'VLA models bridge camera input and language commands to generate robot actions in one unified pipeline.',
    mission: 'Connect language, vision and physical action.',
    topics: [
      'Vision Encoder',
      'Language Model',
      'Action Tokens',
      'End-to-End Control',
      'Instruction Following'
    ],
    icon: '◇',
    color: 'green',
    x: 2480,
    y: 380,
    labType: 'vla'
  },
  {
    id: 9,
    key: 'autonomous',
    titleEn: 'AUTONOMOUS ROBOT',
    titleZh: '自主機器人',
    shortDesc: 'Build a robot that can perceive, think and act.',
    fullDesc: 'Combine perception, world models, agents, planners and controllers into a complete autonomous system.',
    mission: 'Build a robot that can perceive, think and act.',
    topics: [
      'Full Stack Architecture',
      'Perception Pipeline',
      'World Model',
      'AI Agent + Planner',
      'VLA + Controller',
      'Closed-Loop Autonomy'
    ],
    icon: '⬢',
    color: 'green',
    x: 2750,
    y: 520,
    labType: 'autonomous'
  },
  {
    id: 10,
    key: 'final',
    titleEn: 'FINAL MISSION',
    titleZh: '自主 AI 機器人專題',
    shortDesc: 'Create your autonomous AI robot.',
    fullDesc: 'Integrate everything: Generative AI, Multimodal, Agents, Vision, Sensors, Control, Embodied AI and VLA into one complete system.',
    mission: 'Create an autonomous robot that understands a human instruction, observes its environment, makes a plan, and performs an action.',
    topics: [
      'System Integration',
      'Architecture Design',
      'End-to-End Pipeline',
      'Cloud · Edge · On-device',
      'Real-world Deployment'
    ],
    icon: '★',
    color: 'green',
    x: 2950,
    y: 700,
    labType: 'final',
    isFinal: true
  }
];

/* Optional Edge Robot branch note */
const EDGE_BRANCH = {
  title: 'EDGE ROBOT PATH',
  desc: 'Cloud AI · Edge AI · On-device AI hybrid architectures for real robots.'
};
