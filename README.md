# LadySi

A Claude Code mod with a manga ink-and-sage theme. It is built around one wallpaper.

- **Theme:** sage paper, teal accents, and heavy ink blacks, with the wallpaper as the backdrop.
- **Band above the prompt:** an autumn strip with a round portrait frame, the character 祀, and falling maple leaves. A teal ring turns while Claude works.
- **Pane:** `/ladysi pane` shows the wallpaper beside the chat. If a surface cannot draw themes, the mod opens this pane at session start.

## Install

At the prompt of a terminal session:

```
/plugin install ladysi --marketplace yuezhix/ladysi-theme
```

Answer `y` to add the marketplace, then pick a scope (the user scope is the first one).

From a shell:

```bash
claude plugin install ladysi --marketplace yuezhix/ladysi-theme
```

In the desktop app, where `/plugin` does not run: click **+** next to the prompt box, then **Plugins**, **Add marketplace** with `yuezhix/ladysi-theme`, then **Add plugin**.

## Commands

| Command | Effect |
| --- | --- |
| `/ladysi` | Turn the theme on |
| `/ladysi pane` | Show the wallpaper in a pane |
| `/ladysi off` | Remove the theme for this session |
| `/ladysi image on\|off\|auto` | In the terminal: real pictures (`on`), cell drawings (`off`), or pick by terminal (`auto`, the default) |

## In the terminal (CLI)

The terminal has no SVG, so the mod draws its own versions there:

- **Band above the prompt:** the round portrait, an autumn strip with the two figures, and the line. The frame turns teal, 枫 becomes 绘, and the band shows 落笔中…… while Claude works. On a short terminal it shrinks to one line.
- **Pane:** `/ladysi pane` shows the wallpaper at the pane's width.
- **Pictures:** kitty, Ghostty and iTerm2 3.5+ (with fullscreen rendering) show the real pictures. All other terminals, Windows Terminal included, show colored quadrant-block cell drawings (2 x 2 pixels a cell). Use `/ladysi image on` or `off` to override the choice.

## Credits

The text images use the Zhi Mang Xing font (SIL Open Font License 1.1).

## 声明 / Notice

- 本仓库为粉丝自制，仅供粉丝免费使用，**禁止任何商业用途**。
- 仓库中的角色图片（壁纸、头像、秋景图）版权归原作者及版权方所有，本仓库不主张其任何权利。
- 如有侵权，请通过 GitHub Issues 联系，收到后将立即把仓库设为私有并关闭分发渠道。

- This is a fan-made project. It is free for fans to use. **Commercial use is not allowed.**
- The character images (wallpaper, portrait, autumn picture) belong to their original creators and rights holders. This repository claims no rights to them.
- If any content infringes your rights, open a GitHub issue. The repository will then be made private and distribution will stop.
