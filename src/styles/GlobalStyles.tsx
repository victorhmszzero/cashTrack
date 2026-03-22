import { createGlobalStyle } from 'styled-components'

export const GlobalStyles = createGlobalStyle`
  body {
    background: ${p => p.theme.bg.page};
    color: ${p => p.theme.text.primary};
    font-family: ${p => p.theme.font.sans};
    transition: background 0.2s, color 0.2s;
    min-height: 100vh;
  }

  *::-webkit-scrollbar {
    width: 5px;
    height: 5px;
  }
  *::-webkit-scrollbar-track { background: transparent; }
  *::-webkit-scrollbar-thumb {
    background: ${p => p.theme.border};
    border-radius: 4px;
  }

  input[type="range"] {
    accent-color: ${p => p.theme.accent};
  }

  input[type="checkbox"] {
    accent-color: ${p => p.theme.accent};
    width: 1rem;
    height: 1rem;
  }
`
