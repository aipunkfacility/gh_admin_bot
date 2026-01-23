---
name: telegram-bot-expert
description: Expert knowledge for Telegraf (Node.js) and Telegram Bot API. Use when creating scenes, keyboards, handling errors, or working with bot logic.
---

# Telegram Bot Expert

Best practices and patterns for the Green Hill Telegram Bot.

## Core Concepts

### 1. Scenes (WizardScene)

Use scenes for multi-step interactions (e.g., Currency Exchange, Booking).

- Always provide a "Cancel" button/command.
- Store state in `ctx.wizard.state`.
- Validate input at each step.

### 2. Keyboards (Markup)

- **InlineKeyboard**: For actions (Callbacks).
- **ReplyKeyboard**: For persistent menus (Main Menu).
- **Pagination**: Use `buildPaginationKeyboard` utility (to be created) for lists.

### 3. Error Handling

- Wrap all async actions in `try/catch`.
- Always answer callbacks: `await ctx.answerCbQuery().catch(console.error)`.
- Use a global error handler in `scripts/poll.js`.

### 4. Media Handling

- **Images**: Must be HTTPS URL or File ID.
- **Captions**: Support HTML (bold, italic, links). Limit: 1024 chars.

## Code Snippets

**Safe Action Wrapper:**

```javascript
const safeAction = (name, handler) => async (ctx) => {
    try {
        await handler(ctx);
    } catch (e) {
        console.error(`Error in action ${name}:`, e);
        await ctx.reply('Произошла ошибка. Попробуйте позже.');
    }
};
```
