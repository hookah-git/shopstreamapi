import { defineConfig } from 'vitepress'

const base = process.env.DOCS_BASE ?? '/'

export default defineConfig({
  base,
  title: 'StreamShop API',
  description: 'Документация и SDK публичного API StreamShop',
  lang: 'ru-RU',
  cleanUrls: true,
  appearance: 'force-dark',
  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: `${base}favicon.svg` }],
  ],
  themeConfig: {
    logo: undefined,
    siteTitle: 'StreamShop API',
    nav: [
      { text: 'API', link: '/#op-listServices' },
      { text: 'SDK', link: '/#sdk' },
      { text: 'shop-stream.ru', link: 'https://shop-stream.ru' },
    ],
    sidebar: [
      {
        text: 'Обзор',
        items: [
          { text: 'Введение', link: '/#top' },
          { text: 'Аутентификация', link: '/#auth' },
          { text: 'Конверт ответа', link: '/#envelope' },
          { text: 'Ошибки и лимиты', link: '/#errors' },
          { text: 'Перечисления', link: '/#enums' },
        ],
      },
      {
        text: 'API Reference',
        items: [
          { text: 'GET · Список услуг', link: '/#op-listServices' },
          { text: 'GET · Баланс', link: '/#op-getBalance' },
          { text: 'POST · Создать заказ', link: '/#op-createChatOrder' },
          { text: 'GET · Заказ по id', link: '/#op-getOrder' },
        ],
      },
      {
        text: 'SDK',
        items: [{ text: 'JS · Python · PHP · Go', link: '/#sdk' }],
      },
    ],
    docFooter: { prev: false, next: false },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/hookah-git/shopstreamapi' },
    ],
  },
})
