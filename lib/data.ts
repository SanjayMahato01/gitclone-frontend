export type Repo = { name: string; description: string; stars: string; forks: string; language: string; color: string; updated: string; owner: string }

export const repos: Repo[] = [
  { name: 'facebook/react', owner: 'facebook', description: 'The library for web and native user interfaces.', stars: '235k', forks: '48.1k', language: 'JavaScript', color: '#f1e05a', updated: 'Updated 2 hours ago' },
  { name: 'vercel/next.js', owner: 'vercel', description: 'The React framework for the web.', stars: '131k', forks: '28.2k', language: 'JavaScript', color: '#f1e05a', updated: 'Updated 5 hours ago' },
  { name: 'microsoft/vscode', owner: 'microsoft', description: 'Visual Studio Code — open source code editor.', stars: '167k', forks: '29.4k', language: 'TypeScript', color: '#3178c6', updated: 'Updated yesterday' },
  { name: 'tailwindlabs/tailwindcss', owner: 'tailwindlabs', description: 'A utility-first CSS framework for rapidly building custom designs.', stars: '86.8k', forks: '4.4k', language: 'TypeScript', color: '#3178c6', updated: 'Updated 2 days ago' },
  { name: 'shadcn-ui/ui', owner: 'shadcn-ui', description: 'Beautifully designed components built with Radix UI and Tailwind CSS.', stars: '98.4k', forks: '12.7k', language: 'TypeScript', color: '#3178c6', updated: 'Updated 3 days ago' },
]