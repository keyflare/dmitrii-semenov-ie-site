import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { JSDOM } from "jsdom";
import ts from "typescript";
import { analyticsConfig, analyticsScriptPath } from "../app/analytics/config";

function analyticsError(file: string) {
  return new Error(
    `Independent or duplicate website analytics in ${file}; exports must use the shared publication runtime.`,
  );
}

// Parse code rather than remove product-specific filenames or rewrite application logic.
export function assertNoIndependentAnalytics(source: string, file: string) {
  const ast = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
  function visit(node: ts.Node) {
    if (
      (ts.isIdentifier(node) && ["ym", "Metrika", "Metrika2"].includes(node.text)) ||
      (ts.isStringLiteralLike(node) &&
        (node.text === "ym" ||
          node.text.includes("mc.yandex.") ||
          node.text.includes("metrika/tag.js")))
    ) {
      throw analyticsError(file);
    }
    ts.forEachChild(node, visit);
  }
  visit(ast);
}

function inspectDocument(doc: Document, file: string, allowShared: boolean) {
  for (const element of doc.querySelectorAll("*")) {
    for (const attribute of element.attributes) {
      if (attribute.name.startsWith("on")) assertNoIndependentAnalytics(attribute.value, file);
      if (
        attribute.value.includes("mc.yandex.") ||
        (!allowShared && attribute.name === "data-site-analytics")
      )
        throw analyticsError(file);
    }
  }
  for (const script of doc.querySelectorAll("script")) {
    if (script.getAttribute("src") === analyticsScriptPath) {
      if (!allowShared) throw analyticsError(file);
    } else if (
      !script.type ||
      ["module", "text/javascript", "application/javascript"].includes(script.type)
    ) {
      assertNoIndependentAnalytics(script.textContent ?? "", file);
    }
  }
}

export function installAnalyticsMarkup(html: string, file: string) {
  const dom = new JSDOM(html);
  try {
    inspectDocument(dom.window.document, file, false);
    const script = dom.window.document.createElement("script");
    script.src = analyticsScriptPath;
    script.defer = true;
    script.dataset.siteAnalytics = "shared";
    dom.window.document.body.append(script);
    return dom.serialize();
  } finally {
    dom.window.close();
  }
}

export function assertAnalyticsInstallation(html: string, file: string) {
  const dom = new JSDOM(html);
  try {
    const scripts = dom.window.document.querySelectorAll("script[data-site-analytics]");
    if (
      scripts.length !== 1 ||
      scripts[0].getAttribute("data-site-analytics") !== "shared" ||
      scripts[0].getAttribute("src") !== analyticsScriptPath ||
      !scripts[0].hasAttribute("defer")
    )
      throw analyticsError(file);
    if (dom.window.document.querySelectorAll(`script[src="${analyticsScriptPath}"]`).length !== 1)
      throw analyticsError(file);
    inspectDocument(dom.window.document, file, true);
  } finally {
    dom.window.close();
  }
}

export async function writeAnalyticsRuntime(directory: string) {
  for (const site of analyticsConfig.sites) {
    if (site.paths.length && (!site.counterId || !Number.isSafeInteger(site.counterId))) {
      throw new Error(`Missing website analytics counter for ${site.key}.`);
    }
  }
  const source = await readFile(new URL("../app/analytics/runtime.ts", import.meta.url), "utf8");
  const compiled = ts.transpileModule(source, {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS },
  }).outputText;
  // CommonJS exports stay private to this IIFE; no runtime module loader is needed.
  const browser = `/* Generated from app/analytics/runtime.ts and config.ts. */\n(function () {\nconst exports = {};\n${compiled}\nexports.installAnalytics(window, ${JSON.stringify(analyticsConfig)});\n})();\n`;
  await mkdir(directory, { recursive: true });
  await writeFile(join(directory, analyticsScriptPath.slice(1)), browser);
}
