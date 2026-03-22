import { createGlobalStyle } from 'styled-components'

export const GlobalStyles = createGlobalStyle`
  body {
    background: ${p => p.theme.bg.page***REMOVED***
    color: ${p => p.theme.text.primary***REMOVED***
    font-family: ${p => p.theme.font.sans***REMOVED***
    transition: background 0.2s, color 0.2s;
    min-height: 100vh;
  }

  *::-webkit-scrollbar {
    width: 5px;
    height: 5px;
  }
  *::-webkit-scrollbar-track { background: transparent; }
  *::-webkit-scrollbar-thumb {
    background: ${p => p.theme.border***REMOVED***
    border-radius: 4px;
  }

  input[type="range"] {
    accent-color: ${p => p.theme.accent***REMOVED***
  }

  input[type="checkbox"] {
    accent-color: ${p => p.theme.accent***REMOVED***
    width: 1rem;
    height: 1rem;
  }
`
