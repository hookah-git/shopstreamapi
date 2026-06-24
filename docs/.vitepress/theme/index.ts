import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import { theme, useOpenapi, useTheme } from 'vitepress-openapi/client'
import 'vitepress-openapi/dist/style.css'
import './custom.css'

import spec from '../../public/openapi.json'

export default {
  extends: DefaultTheme,
  async enhanceApp({ app }) {
    useOpenapi({ spec })

    useTheme({
      operation: {
        hiddenSlots: [
          'header',
          'branding',
          'playground',
          'responses',
          'code-samples',
        ],
        cols: 1,
      },
      requestBody: { defaultView: 'contentType' },
      response: { body: { defaultView: 'contentType' } },
    })

    theme.enhanceApp({ app })
  },
} satisfies Theme
