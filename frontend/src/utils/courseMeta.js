const CATEGORY_RULES = [
  { category: 'Backend Engineering', keywords: ['java', 'spring', 'node', 'api', 'backend', 'mysql', 'mongo', 'observability', 'security', 'cloud', 'incident', 'release'] },
  { category: 'Frontend Experience', keywords: ['react', 'frontend', 'design', 'ux', 'ui', 'accessibility', 'visualization', 'search', 'architecture'] },
  { category: 'Product and Analytics', keywords: ['analytics', 'product', 'discovery', 'roadmapping', 'support', 'knowledge', 'metrics'] },
  { category: 'Leadership and Delivery', keywords: ['leadership', 'agile', 'delivery', 'review', 'communication', 'developer experience'] },
  { category: 'AI and Automation', keywords: ['ai'] }
];

const TOPIC_RULES = [
  { topic: 'java', keywords: ['java', 'jvm'] },
  { topic: 'spring', keywords: ['spring boot', 'spring'] },
  { topic: 'react', keywords: ['react'] },
  { topic: 'javascript', keywords: ['javascript', 'ecmascript'] },
  { topic: 'node', keywords: ['node', 'node.js'] },
  { topic: 'mongodb', keywords: ['mongodb', 'mongo'] },
  { topic: 'mysql', keywords: ['mysql', 'sql', 'querying'] },
  { topic: 'ux', keywords: ['ux', 'writing', 'microcopy', 'onboarding'] },
  { topic: 'design', keywords: ['design system', 'design systems', 'design'] },
  { topic: 'security', keywords: ['security', 'authentication', 'authorization', 'oauth', 'jwt'] },
  { topic: 'analytics', keywords: ['analytics', 'metrics', 'cohort', 'insight'] },
  { topic: 'agile', keywords: ['agile', 'delivery', 'sprint', 'retrospective'] },
  { topic: 'ai', keywords: ['ai', 'artificial intelligence', 'machine learning', 'llm'] },
  { topic: 'cloud', keywords: ['cloud', 'deployment', 'infrastructure'] },
  { topic: 'performance', keywords: ['performance', 'optimization', 'rendering'] },
  { topic: 'leadership', keywords: ['leadership', 'communication', 'delegation'] },
  { topic: 'api', keywords: ['api', 'rest', 'versioning'] },
  { topic: 'incident', keywords: ['incident', 'on-call', 'postmortem'] },
  { topic: 'testing', keywords: ['testing', 'tests', 'test'] },
  { topic: 'observability', keywords: ['observability', 'logging', 'tracing'] },
  { topic: 'discovery', keywords: ['discovery', 'roadmapping', 'product discovery'] },
  { topic: 'support', keywords: ['support', 'customer'] },
  { topic: 'release', keywords: ['release', 'change management'] },
  { topic: 'code_review', keywords: ['code review', 'pull request', 'pr review'] },
  { topic: 'information_arch', keywords: ['information architecture', 'navigation'] },
  { topic: 'metrics', keywords: ['metrics', 'kpi', 'okr'] },
  { topic: 'search', keywords: ['search', 'discovery'] },
  { topic: 'data_viz', keywords: ['visualization', 'data visualization', 'charts'] },
  { topic: 'accessibility', keywords: ['accessibility', 'a11y'] },
  { topic: 'knowledge', keywords: ['knowledge base', 'documentation', 'kb'] }
];

const TOPIC_VIDEO_QUERIES = {
  java: ['Java fundamentals tutorial', 'Java testing best practices', 'Java performance tuning'],
  spring: ['Spring Boot REST API tutorial', 'Spring Boot security basics', 'Spring Boot testing guide'],
  react: ['React component patterns', 'React hooks tutorial', 'React performance optimization'],
  javascript: ['Modern JavaScript patterns', 'Async await JavaScript tutorial', 'JavaScript clean code'],
  node: ['Node.js service architecture', 'Node.js error handling', 'Node.js validation middleware'],
  mongodb: ['MongoDB schema design', 'MongoDB aggregation pipeline', 'MongoDB indexing basics'],
  mysql: ['MySQL query optimization', 'SQL joins explained', 'MySQL indexing strategy'],
  ux: ['UX writing basics', 'Microcopy examples for UX', 'Onboarding UX patterns'],
  design: ['Design systems fundamentals', 'Design tokens tutorial', 'Component library workflow'],
  security: ['Authentication flows explained', 'OAuth 2.0 basics', 'Secure API design'],
  analytics: ['Product analytics overview', 'Metrics frameworks', 'Cohort analysis tutorial'],
  agile: ['Agile delivery rituals', 'Sprint planning for engineers', 'Agile retrospectives'],
  ai: ['Practical AI for product teams', 'AI risks and governance', 'LLM basics'],
  cloud: ['Cloud readiness checklist', 'Deployment pipelines explained', 'Infrastructure basics'],
  performance: ['Frontend performance tips', 'Web performance metrics', 'Rendering optimization'],
  leadership: ['Technical leadership skills', 'Engineering communication', 'Delegation for leaders'],
  api: ['API design best practices', 'REST API versioning strategies', 'API review checklist'],
  incident: ['Incident response playbook', 'Postmortem process', 'On-call best practices'],
  testing: ['Testing strategies for engineers', 'Unit vs integration tests', 'Testing React applications'],
  observability: ['Observability fundamentals', 'Distributed tracing', 'Logging best practices'],
  discovery: ['Product discovery process', 'User research basics', 'MVP prioritization'],
  support: ['Customer support engineering', 'Debugging production issues', 'Support workflow playbooks'],
  release: ['Release management process', 'Deployment checklist', 'Change management'],
  code_review: ['Code review best practices', 'Pull request guidelines', 'Review culture'],
  information_arch: ['Information architecture basics', 'Navigation design patterns', 'Content hierarchy'],
  metrics: ['Metrics driven roadmaps', 'North star metrics', 'OKR metrics explained'],
  search: ['Search ranking basics', 'Search UX patterns', 'Search relevance tuning'],
  data_viz: ['Data visualization principles', 'Chart selection guide', 'Dashboard storytelling'],
  accessibility: ['Web accessibility basics', 'WCAG overview', 'Accessible forms'],
  knowledge: ['Knowledge base design', 'Documentation best practices', 'Support content strategy']
};

const DEFAULT_VIDEO_QUERIES = [
  'Learning how to learn effectively',
  'Building strong study habits',
  'How to retain new technical skills'
];

function normalize(text) {
  return String(text || '').toLowerCase();
}

export function getCourseCategory(course) {
  const haystack = normalize(`${course?.title || ''} ${course?.description || ''}`);

  for (const rule of CATEGORY_RULES) {
    if (rule.keywords.some((keyword) => haystack.includes(keyword))) {
      return rule.category;
    }
  }

  return 'General';
}

export function getCourseCategories(courses) {
  return ['All Categories', ...new Set((courses || []).map(getCourseCategory))];
}

export function getRecommendedVideos(course, moduleItem) {
  const haystack = normalize(`${course?.title || ''} ${course?.description || ''} ${moduleItem?.module_name || ''}`);
  const matchedTopics = TOPIC_RULES
    .filter((rule) => rule.keywords.some((keyword) => haystack.includes(keyword)))
    .map((rule) => rule.topic);

  const dynamicQueries = [];
  if (moduleItem?.module_name) {
    dynamicQueries.push(`${moduleItem.module_name} tutorial`, `${moduleItem.module_name} best practices`);
  }
  if (course?.title) {
    dynamicQueries.push(`${course.title} overview`, `${course.title} real world examples`);
  }

  const topicQueries = matchedTopics.flatMap((topic) => TOPIC_VIDEO_QUERIES[topic] || []);
  const allQueries = [...dynamicQueries, ...topicQueries].map((query) => query.trim()).filter(Boolean);

  const uniqueQueries = [...new Set(allQueries)];
  const finalQueries = uniqueQueries.length ? uniqueQueries.slice(0, 4) : DEFAULT_VIDEO_QUERIES;

  return finalQueries.map((query, index) => ({
    id: `${moduleItem?.id || course?.title || 'course'}-${index}`,
    title: query,
    embedUrl: `https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(query)}`
  }));
}

export function buildModuleQuiz(moduleItem) {
  const lessonTitles = moduleItem?.lessons?.map((lesson) => lesson.lesson_name) || [];
  const focusA = lessonTitles[0] || 'core concepts';
  const focusB = lessonTitles[1] || 'applied workflow';
  const focusC = lessonTitles[2] || 'quality review';

  return [
    {
      id: `${moduleItem?.id || 'module'}-q1`,
      prompt: `Which lesson from ${moduleItem?.module_name || 'this module'} would you revisit first before a real implementation?`,
      options: [focusA, focusB, focusC],
      answer: focusA
    },
    {
      id: `${moduleItem?.id || 'module'}-q2`,
      prompt: 'Which module habit most directly improves production confidence?',
      options: ['Skipping reviews to move faster', 'Applying lessons to real workflows', 'Relying only on memory'],
      answer: 'Applying lessons to real workflows'
    },
    {
      id: `${moduleItem?.id || 'module'}-q3`,
      prompt: 'What should happen after finishing a module?',
      options: ['Reflect, practice, and carry the lesson into the next task', 'Close the tab and stop tracking progress', 'Ignore earlier material'],
      answer: 'Reflect, practice, and carry the lesson into the next task'
    }
  ];
}
