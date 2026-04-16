import { indigo } from "@mui/material/colors";

export const colors = {
  // base
  deepNavy: "rgb(7,15,21)",
  primaryMain: indigo[800],
  textPrimary: "rgba(255,255,255,0.9)",
  textSecondary: "rgba(255,255,255,0.6)",

  // interactive
  interactiveSelected: "rgba(40,53,147,0.45)",
  interactiveHover: "rgba(40,53,147,0.24)",
  interactiveFocused: "rgba(40,53,147,0.09)",
  interactiveBorder: "rgba(21,68,189,0.25)",
  interactiveShadowColor: "rgba(21,68,189,0.13)",
  interactiveShadowFocusedColor: "rgba(21,68,189,0.17)",

  // messages
  messageMine: "rgba(21,69,189,0.15)",
  messageOther: "#283593",

  // avatar
  avatarBackground: "rgba(40,53,147,0.76)",
  avatarColor: "rgba(255,255,255,0.9)",

  // paper
  paperBorder: "rgba(40,53,147,0.45)",
} as const;
