import { defineConfig } from 'vitepress'

export default defineConfig({
  base: '/opencode/',
  title: 'OpenCode Workflow',
  description: 'A personal OpenCode V2 setup for planning, implementation, and review.',
  lastUpdated: true,
  themeConfig: {
    nav: [
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'Reference', link: '/reference/agents' }
    ],
    sidebar: {
      '/guide/': [
        {
          text: 'Guide',
          items: [
            { text: 'Getting Started', link: '/guide/getting-started' },
            { text: 'About the Setup', link: '/guide/about-setup' },
            { text: 'Commands and Workflows', link: '/guide/commands-and-workflows' },
            { text: 'Using the Setup', link: '/guide/using-the-setup' },
            { text: 'Workers', link: '/guide/workers' }
          ]
        }
      ],
      '/reference/': [
        {
          text: 'Reference',
          items: [
            { text: 'Agents', link: '/reference/agents' },
            { text: 'Commands', link: '/reference/commands' },
            { text: 'Skills', link: '/reference/skills' },
            { text: 'Architecture', link: '/reference/architecture' }
          ]
        }
      ]
    },
    search: {
      provider: 'local'
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/devharshthakur/opencode' }
    ],
    editLink: {
      pattern: 'https://github.com/devharshthakur/opencode/edit/main/docs/:path',
      text: 'Edit this page on GitHub'
    },
    outline: {
      level: [2, 3]
    },
    docFooter: {
      prev: 'Previous',
      next: 'Next'
    }
  }
})
