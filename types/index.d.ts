// How many dots the thinking line shows now, 1 to 6.
export type ThinkingDots = number

// The folded tool-call groups the person opened, by their first call's id; the last 50.
export type OpenGroups = string[]

declare module 'claude-code' {
  interface PluginState {
    ladysi: {
      thinkingDots: ThinkingDots
      openGroups: OpenGroups
    }
  }
}
