export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: { extend: {
    colors: { ink: '#0a1020', panel: '#111a2e', line: '#1e2a44', bull: '#19c37d', bear: '#f0454f', gold: '#e8b43a' },
    fontFamily: { head: ['Sora', 'sans-serif'], body: ['IBM Plex Sans', 'sans-serif'] },
    maxWidth: { '4xl': '60rem', '5xl': '70rem', '6xl': '84rem' },
  } },
  plugins: [],
};