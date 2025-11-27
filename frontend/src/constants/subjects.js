// B.Tech Subjects and Tech Stacks
export const SUBJECTS = {
  'Core Subjects': [
    'Data Structures',
    'Algorithms',
    'Database Management Systems',
    'Operating Systems',
    'Computer Networks',
    'Software Engineering',
    'Compiler Design',
    'Theory of Computation',
    'Discrete Mathematics',
    'Linear Algebra',
    'Calculus',
    'Physics',
    'Chemistry'
  ],
  'Programming Languages': [
    'C',
    'C++',
    'Java',
    'Python',
    'JavaScript',
    'TypeScript',
    'Go',
    'Rust',
    'PHP',
    'Ruby',
    'C#',
    '.NET'
  ],
  'Web Development': [
    'HTML/CSS',
    'React',
    'Vue.js',
    'Angular',
    'Node.js',
    'Express.js',
    'Django',
    'Flask',
    'Spring Boot',
    'ASP.NET',
    'REST APIs',
    'GraphQL'
  ],
  'Mobile Development': [
    'Android',
    'iOS',
    'React Native',
    'Flutter',
    'Kotlin',
    'Swift',
    'Xamarin'
  ],
  'Cloud & DevOps': [
    'AWS',
    'Azure',
    'Google Cloud',
    'Docker',
    'Kubernetes',
    'CI/CD',
    'Jenkins',
    'GitLab CI',
    'Terraform',
    'Ansible'
  ],
  'Data Science & AI': [
    'Machine Learning',
    'Deep Learning',
    'TensorFlow',
    'PyTorch',
    'Natural Language Processing',
    'Computer Vision',
    'Data Analysis',
    'Pandas',
    'NumPy',
    'Scikit-learn'
  ],
  'Databases': [
    'MySQL',
    'PostgreSQL',
    'MongoDB',
    'Redis',
    'Cassandra',
    'Firebase',
    'DynamoDB',
    'Elasticsearch'
  ],
  'Other Technologies': [
    'Git & GitHub',
    'Linux',
    'Windows Server',
    'Cybersecurity',
    'Blockchain',
    'IoT',
    'Microservices',
    'System Design',
    'Design Patterns',
    'Testing & QA'
  ]
};

export const TECH_STACKS = [
  'MERN (MongoDB, Express, React, Node.js)',
  'MEAN (MongoDB, Express, Angular, Node.js)',
  'LAMP (Linux, Apache, MySQL, PHP)',
  'LEMP (Linux, Nginx, MySQL, PHP)',
  'JAM (JavaScript, APIs, Markup)',
  'Python Django',
  'Python Flask',
  'Java Spring Boot',
  'ASP.NET Core',
  'Ruby on Rails',
  'Vue.js + Node.js',
  'Next.js',
  'Nuxt.js',
  'Flutter',
  'React Native',
  'AWS Lambda',
  'Serverless',
  'Microservices Architecture',
  'GraphQL + Apollo',
  'REST API Architecture'
];

export const PRIORITY_LEVELS = [
  { value: 'low', label: 'Low', color: 'bg-blue-100 text-blue-800' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'high', label: 'High', color: 'bg-red-100 text-red-800' }
];

export const DOUBT_TYPES = [
  { value: 'concept', label: '📚 Concept Doubt', icon: '📚' },
  { value: 'project', label: '🚀 Project Doubt', icon: '🚀' }
];

export const getAllSubjects = () => {
  const allSubjects = [];
  Object.values(SUBJECTS).forEach(category => {
    allSubjects.push(...category);
  });
  return allSubjects.sort();
};

// Flatten subjects array for dropdown
export const SUBJECTS_FLAT = getAllSubjects();
