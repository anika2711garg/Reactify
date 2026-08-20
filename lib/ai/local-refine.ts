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

function bumpSpacing(code: string) {
  return code
    .replace(/\b(p|px|py|pt|pb|m|mx|my|mt|mb|gap|space-x|space-y)-(\d+)\b/g, (_full, prefix, value) => {
      const next = Math.min(24, Number(value) + 2);
      return `${prefix}-${next}`;
    })
    .replace(/\bspace-y-(\d+)\b/g, (_full, value) => `space-y-${Math.min(24, Number(value) + 2)}`);
}

function applyMinimal(code: string) {
  return code
    .replace(/\bshadow-(?:sm|md|lg|xl|2xl|float)\b/g, "shadow-none")
    .replace(/\brounded-(?:2xl|3xl|\[16px\])\b/g, "rounded-lg");
}

function applyMotion(code: string) {
  return code.replace(
    /(className=")([^"]*)(")/g,
    (full, before, classes, after) => {
      if (classes.includes("transition")) return full;
      return `${before}${classes} transition-all duration-300${after}`;
    }
  );
}

export function applyLocalInstruction(code: string, instruction: string) {
  if (!code.trim()) return null;
  const text = instruction.toLowerCase();
  const color = requestedColor(text);
  if (color && /(colo(u)?r|text|font|heading|title|make)/.test(text)) {
    const next = applyTextColor(code, COLOR_NAMES[color]);
    return next === code ? null : next;
  }
  if (/increase spacing|more space|more padding/.test(text)) {
    const next = bumpSpacing(code);
    return next === code ? null : next;
  }
  if (/more minimal|make it minimal/.test(text)) {
    const next = applyMinimal(code);
    return next === code ? null : next;
  }
  if (/animation|animate/.test(text)) {
    const next = applyMotion(code);
    return next === code ? null : next;
  }
  return null;
}
