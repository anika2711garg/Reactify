import { parse } from "@babel/parser";
import generateModule from "@babel/generator";
import traverseModule from "@babel/traverse";
import * as t from "@babel/types";

const generate = (generateModule as { default?: typeof generateModule }).default || generateModule;
const traverse = (traverseModule as { default?: typeof traverseModule }).default || traverseModule;

export interface ComponentTreeNode {
  id: string;
  name: string;
  type: "host" | "component";
  className?: string;
  text?: string;
  children: ComponentTreeNode[];
}

export interface JsxAnalysis {
  tree: ComponentTreeNode[];
  instrumented: string;
  componentName: string | null;
  warnings: string[];
}

function jsxName(name: t.JSXIdentifier | t.JSXMemberExpression | t.JSXNamespacedName): string {
  if (t.isJSXIdentifier(name)) return name.name;
  if (t.isJSXNamespacedName(name)) return `${name.namespace.name}:${name.name.name}`;
  return `${jsxName(name.object)}.${name.property.name}`;
}

function classNameFromAttributes(attributes: t.JSXOpeningElement["attributes"]) {
  const attr = attributes.find(
    (item): item is t.JSXAttribute => t.isJSXAttribute(item) && t.isJSXIdentifier(item.name) && item.name.name === "className"
  );
  if (!attr?.value) return undefined;
  if (t.isStringLiteral(attr.value)) return attr.value.value;
  if (t.isJSXExpressionContainer(attr.value) && t.isStringLiteral(attr.value.expression)) {
    return attr.value.expression.value;
  }
  return undefined;
}

function textFromChildren(children: t.JSXElement["children"]) {
  const parts = children
    .filter((child): child is t.JSXText => t.isJSXText(child))
    .map((child) => child.value.replace(/\s+/g, " ").trim())
    .filter(Boolean);
  return parts[0]?.slice(0, 48);
}

function shouldSkip(name: string) {
  return name === "Fragment" || name === "React.Fragment";
}

export function analyzeJsx(code: string): JsxAnalysis {
  const warnings: string[] = [];
  if (!code.trim()) {
    return { tree: [], instrumented: code, componentName: null, warnings: ["No generated code to analyze."] };
  }

  let ast;
  try {
    ast = parse(code, {
      sourceType: "module",
      plugins: ["jsx", "typescript"],
      errorRecovery: true,
    });
  } catch (error) {
    return {
      tree: [],
      instrumented: code,
      componentName: null,
      warnings: [error instanceof Error ? error.message : "Failed to parse JSX."],
    };
  }

  const roots: ComponentTreeNode[] = [];
  let componentName: string | null = null;

  traverse(ast, {
    FunctionDeclaration(path) {
      if (!componentName && path.node.id?.name) componentName = path.node.id.name;
    },
    VariableDeclarator(path) {
      if (!componentName && t.isIdentifier(path.node.id) && (t.isArrowFunctionExpression(path.node.init) || t.isFunctionExpression(path.node.init))) {
        componentName = path.node.id.name;
      }
    },
    ExportDefaultDeclaration(path) {
      if (t.isFunctionDeclaration(path.node.declaration) && path.node.declaration.id) {
        componentName = path.node.declaration.id.name;
      }
    },
  });

  const rootElements: t.JSXElement[] = [];
  traverse(ast, {
    ReturnStatement(path) {
      const arg = path.node.argument;
      if (t.isJSXElement(arg)) rootElements.push(arg);
      if (t.isJSXFragment(arg)) {
        arg.children.forEach((child) => {
          if (t.isJSXElement(child)) rootElements.push(child);
        });
      }
    },
  });

  const uniqueRoots = Array.from(new Set(rootElements));

  const walk = (element: t.JSXElement, path: number[]): ComponentTreeNode | null => {
    const name = jsxName(element.openingElement.name);
    if (shouldSkip(name)) {
      const kids = element.children
        .filter((child): child is t.JSXElement => t.isJSXElement(child))
        .map((child, index) => walk(child, [...path, index]))
        .filter((child): child is ComponentTreeNode => Boolean(child));
      return kids[0]
        ? {
            id: path.join(".") || "0",
            name: "Fragment",
            type: "component",
            children: kids,
          }
        : null;
    }

    const id = path.join(".");
    const className = classNameFromAttributes(element.openingElement.attributes);
    const hasPath = element.openingElement.attributes.some(
      (item) => t.isJSXAttribute(item) && t.isJSXIdentifier(item.name) && item.name.name === "data-rf-path"
    );
    if (!hasPath) {
      element.openingElement.attributes.push(t.jsxAttribute(t.jsxIdentifier("data-rf-path"), t.stringLiteral(id)));
    }

    const children = element.children
      .filter((child): child is t.JSXElement => t.isJSXElement(child))
      .map((child, index) => walk(child, [...path, index]))
      .filter((child): child is ComponentTreeNode => Boolean(child));

    return {
      id,
      name,
      type: /^[A-Z]/.test(name) ? "component" : "host",
      className,
      text: textFromChildren(element.children),
      children,
    };
  };

  uniqueRoots.forEach((element, index) => {
    const node = walk(element, [index]);
    if (node) roots.push(node);
  });

  if (!roots.length) {
    warnings.push("No JSX return tree was found. The preview may still render.");
  }

  let instrumented = code;
  try {
    instrumented = generate(ast, { retainLines: true, compact: false }).code;
  } catch {
    warnings.push("Could not instrument JSX for selection. Tree clicks may not highlight.");
  }

  return { tree: roots, instrumented, componentName, warnings };
}

export function findTreeNode(nodes: ComponentTreeNode[], id: string): ComponentTreeNode | null {
  for (const node of nodes) {
    if (node.id === id) return node;
    const child = findTreeNode(node.children, id);
    if (child) return child;
  }
  return null;
}
