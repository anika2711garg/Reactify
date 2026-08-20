const COLOR_NAMES: Record<string, string> = {
  red: "text-red-500",
  blue: "text-blue-500",
  green: "text-green-500",
  yellow: "text-yellow-400",
  orange: "text-orange-500",
  purple: "text-purple-500",
  pink: "text-pink-500",
  white: "text-white",
  black: "text-black",
  gray: "text-gray-500",
  grey: "text-gray-500",
};

const TEXT_COLOR =
  /text-(?:white|black|transparent|current|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|slate|zinc|neutral|stone|gray)-\d{2,3}(?:\/\d+)?|text-white(?:\/\d+)?|text-black(?:\/\d+)?/g;

function hasTextColor(classes: string) {
  return /text-(?:white|black|transparent|current|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|slate|zinc|neutral|stone|gray)(?:-\d{2,3})?(?:\/\d+)?/.test(
    classes
  );
}

function requestedColor(instruction: string) {
  const text = instruction.toLowerCase();
  return Object.keys(COLOR_NAMES).find((name) => new RegExp(`\\b${name}\\b`).test(text));
}

function applyTextColor(code: string, colorClass: string) {
  let next = code.replace(TEXT_COLOR, colorClass);

  next = next.replace(
    /<(h[1-6]|p|span|a|li|label|button)([^>]*className=")([^"]*)(")/g,
    (full, tag, before, classes, after) => {
      if (hasTextColor(classes) || classes.includes(colorClass)) return full;
      return `<${tag}${before}${classes} ${colorClass}${after}`;
    }
  );

  return next;
}

export function applyLocalInstruction(code: string, instruction: string) {
  if (!code.trim()) return null;
  const text = instruction.toLowerCase();
  const color = requestedColor(text);
  if (color && /(colo(u)?r|text|font|heading|title|make)/.test(text)) {
    const next = applyTextColor(code, COLOR_NAMES[color]);
    return next === code ? null : next;
  }
  return null;
}
