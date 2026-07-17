# Шрифты для FirePhoenix

Сюда нужно положить файлы шрифтов:

- `Podarok-Regular.woff2` (или `.woff`/`.ttf`)
- `Coolvetica-Regular.woff2` (или `.woff`/`.ttf`)

Если есть жирные/наклонные начертания — добавьте тоже, по образцу из `src/styles/globals.css`.

Где взять:
- Файлы должны быть у вас на компьютере (там, где шрифт установлен в системе)
- На Windows: `C:\Windows\Fonts\Podarok*.ttf` или поиск по имени
- На Mac: `/Library/Fonts/` или `~/Library/Fonts/`

Что сделать после того как положите файлы:
1. Скажите мне имена файлов (например, `Podarok-Bold.ttf`)
2. Я подключу их в `src/styles/globals.css` через `@font-face`
3. Запушу в репозиторий — Vercel будет отдавать шрифты посетителям
