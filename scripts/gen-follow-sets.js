#!/usr/bin/env node
/**
 * gen-follow-sets.js
 *
 * Reads src/grammar.json (produced by `tree-sitter generate`) and emits
 * lua/vim-teradata/sql-autocomplete/follow_sets.lua for use in the vim-teradata
 * Neovim plugin.
 *
 * Algorithm (classical FIRST/FOLLOW for a context-free grammar, adapted to
 * tree-sitter's JSON rule format):
 *
 *   1. Compute nullable(node): can this node produce ε?
 *   2. Compute FIRST(node): which keyword_* terminals can appear first?
 *   3. Compute LAST(node):  which keyword_* terminals can appear last?
 *   4. Compute FOLLOW(keyword_*) by:
 *      (a) Walking every SEQ in the grammar. For each pair (m_i, m_j) where
 *          m_j is the first non-nullable successor of m_i, every keyword in
 *          LAST(m_i) is followed by every keyword in FIRST(m_j). When m_j is
 *          nullable, continue to m_{j+1}, etc.
 *      (b) Inside REPEAT/REPEAT1, keywords in LAST(content) are followed by
 *          keywords in FIRST(content) (next iteration).
 *      (c) Fixed-point cross-rule propagation: for every rule R, every
 *          occurrence of a SYMBOL referencing R contributes FOLLOW(R) to the
 *          FOLLOW of every keyword in LAST(R). Iterate until no new entries.
 *
 * Usage:
 *   node scripts/gen-follow-sets.js
 *   node scripts/gen-follow-sets.js --out /path/to/follow_sets.lua
 *   node scripts/gen-follow-sets.js --json          # also emit follow_sets.json
 */

'use strict';

const fs   = require('fs');
const path = require('path');

// ---------------------------------------------------------------------------
// CLI args
// ---------------------------------------------------------------------------
const args        = process.argv.slice(2);
const emitJson    = args.includes('--json');
const outIdx      = args.indexOf('--out');
const outPath     = outIdx !== -1
    ? args[outIdx + 1]
    : path.join(__dirname, '..', 'lua', 'vim-teradata',
                'sql-autocomplete', 'follow_sets.lua');

// ---------------------------------------------------------------------------
// Load grammar.json
// ---------------------------------------------------------------------------
const grammarPath = path.join(__dirname, '..', 'src', 'grammar.json');
if (!fs.existsSync(grammarPath)) {
    console.error(`ERROR: ${grammarPath} not found.`);
    console.error('Run `tree-sitter generate` first.');
    process.exit(1);
}
const grammar = JSON.parse(fs.readFileSync(grammarPath, 'utf8'));
const rules   = grammar.rules;  // { ruleName -> node }

// ---------------------------------------------------------------------------
// Helpers: unwrap transparent wrappers
// ---------------------------------------------------------------------------

/**
 * Unwrap all transparent wrapper node types that don't affect FIRST/LAST/nullable:
 * PREC, PREC_LEFT, PREC_RIGHT, PREC_DYNAMIC, FIELD, ALIAS, TOKEN, IMMEDIATE_TOKEN.
 */
function unwrap(node) {
    if (!node) return node;
    const transparent = new Set([
        'PREC', 'PREC_LEFT', 'PREC_RIGHT', 'PREC_DYNAMIC',
        'FIELD', 'ALIAS', 'TOKEN', 'IMMEDIATE_TOKEN',
    ]);
    while (node && transparent.has(node.type)) {
        node = node.content ?? node.value ?? node.members?.[0] ?? null;
    }
    return node;
}

/** True when the rule name starts with "keyword_" */
function isKeywordSymbol(name) {
    return typeof name === 'string' && name.startsWith('keyword_');
}

// ---------------------------------------------------------------------------
// nullable
// ---------------------------------------------------------------------------
const nullableCache = new Map();
const nullableInProg = new Set();

function isNullable(node) {
    node = unwrap(node);
    if (!node) return false;

    switch (node.type) {
        case 'BLANK':
            return true;

        case 'STRING':
        case 'PATTERN':
            return false;

        case 'SYMBOL': {
            const name = node.name;
            if (isKeywordSymbol(name)) return false;
            if (!rules[name]) return false;
            if (nullableCache.has(name)) return nullableCache.get(name);
            if (nullableInProg.has(name)) return false; // conservative for cycles
            nullableInProg.add(name);
            const result = isNullable(rules[name]);
            nullableInProg.delete(name);
            nullableCache.set(name, result);
            return result;
        }

        case 'SEQ':
            return node.members.every(m => isNullable(m));

        case 'CHOICE':
            return node.members.some(m => isNullable(m));

        case 'REPEAT':
            return true;

        case 'REPEAT1':
            return isNullable(node.content);

        default:
            return false;
    }
}

// ---------------------------------------------------------------------------
// FIRST — keyword_* terminals that can appear leftmost in a subtree
// ---------------------------------------------------------------------------
const firstCache = new Map();
const firstInProg = new Set();

function computeFirst(node) {
    node = unwrap(node);
    if (!node) return new Set();

    switch (node.type) {
        case 'BLANK':
        case 'STRING':
        case 'PATTERN':
            return new Set();

        case 'SYMBOL': {
            const name = node.name;
            if (isKeywordSymbol(name)) return new Set([name]);
            if (!rules[name]) return new Set();
            if (firstCache.has(name)) return new Set(firstCache.get(name));
            if (firstInProg.has(name)) return new Set();
            firstInProg.add(name);
            const result = computeFirst(rules[name]);
            firstInProg.delete(name);
            firstCache.set(name, new Set(result));
            return result;
        }

        case 'SEQ': {
            const result = new Set();
            for (const member of node.members) {
                for (const kw of computeFirst(member)) result.add(kw);
                if (!isNullable(member)) break;
            }
            return result;
        }

        case 'CHOICE': {
            const result = new Set();
            for (const member of node.members) {
                for (const kw of computeFirst(member)) result.add(kw);
            }
            return result;
        }

        case 'REPEAT':
        case 'REPEAT1':
            return computeFirst(node.content);

        default:
            return new Set();
    }
}

// ---------------------------------------------------------------------------
// LAST — keyword_* terminals that can appear rightmost in a subtree
// ---------------------------------------------------------------------------
const lastCache = new Map();
const lastInProg = new Set();

function computeLast(node) {
    node = unwrap(node);
    if (!node) return new Set();

    switch (node.type) {
        case 'BLANK':
        case 'STRING':
        case 'PATTERN':
            return new Set();

        case 'SYMBOL': {
            const name = node.name;
            if (isKeywordSymbol(name)) return new Set([name]);
            if (!rules[name]) return new Set();
            if (lastCache.has(name)) return new Set(lastCache.get(name));
            if (lastInProg.has(name)) return new Set();
            lastInProg.add(name);
            const result = computeLast(rules[name]);
            lastInProg.delete(name);
            lastCache.set(name, new Set(result));
            return result;
        }

        case 'SEQ': {
            // Right-to-left: collect LAST of each suffix until non-nullable
            const result = new Set();
            for (let i = node.members.length - 1; i >= 0; i--) {
                for (const kw of computeLast(node.members[i])) result.add(kw);
                if (!isNullable(node.members[i])) break;
            }
            return result;
        }

        case 'CHOICE': {
            const result = new Set();
            for (const member of node.members) {
                for (const kw of computeLast(member)) result.add(kw);
            }
            return result;
        }

        case 'REPEAT':
        case 'REPEAT1':
            return computeLast(node.content);

        default:
            return new Set();
    }
}

// ---------------------------------------------------------------------------
// FOLLOW
// ---------------------------------------------------------------------------
// followSets[kw] = Set of keyword_* names that can immediately follow kw.
const followSets = {};

function addFollow(kw, targets) {
    if (!followSets[kw]) followSets[kw] = new Set();
    let changed = false;
    for (const t of targets) {
        if (!followSets[kw].has(t)) {
            followSets[kw].add(t);
            changed = true;
        }
    }
    return changed;
}

// followOfRule[ruleName] = Set of keyword_* names that can immediately follow
// any occurrence of that rule across the whole grammar. Built by a fixed-point
// pass — see below.
const followOfRule = {};

function addFollowOfRule(ruleName, targets) {
    if (!followOfRule[ruleName]) followOfRule[ruleName] = new Set();
    let changed = false;
    for (const t of targets) {
        if (!followOfRule[ruleName].has(t)) {
            followOfRule[ruleName].add(t);
            changed = true;
        }
    }
    return changed;
}

// ---------------------------------------------------------------------------
// Step 1: walk every SEQ/REPEAT in the grammar and record:
//   - Local adjacencies: LAST(m_i) followed by FIRST(m_{i+1..})
//   - Rule-context info: for each SYMBOL m_i referencing a rule R that appears
//     in a SEQ, FIRST of the suffix after m_i contributes to FOLLOW(R).
//     If the suffix is fully nullable, FOLLOW of the enclosing rule contributes
//     to FOLLOW(R) — handled in the fixed-point step.
// ---------------------------------------------------------------------------

// suffixDeps[ruleName] = Array of { enclosingRule, suffixIsNullable }
// "After every occurrence of ruleName, the suffix that follows is either
//  fully described by the FIRST tokens we already added, OR if nullable, we
//  must also inherit FOLLOW(enclosingRule)."
const suffixDeps = {};
function addSuffixDep(ruleName, enclosingRule) {
    if (!enclosingRule) return;
    if (!suffixDeps[ruleName]) suffixDeps[ruleName] = new Set();
    suffixDeps[ruleName].add(enclosingRule);
}

// Track which keyword_* terminals appear at the LAST position of which rules.
// For each rule R, lastKeywordsOfRule[R] = LAST(R). Used in fixed-point.
const lastKeywordsOfRule = {};

function walkRule(ruleName, node) {
    node = unwrap(node);
    if (!node) return;

    switch (node.type) {
        case 'SEQ': {
            const members = node.members;
            for (let i = 0; i < members.length; i++) {
                // (a) Local follow: LAST(m_i) → FIRST(suffix)
                const lastKws = computeLast(members[i]);
                if (lastKws.size > 0) {
                    let j = i + 1;
                    while (j < members.length) {
                        const firstJ = computeFirst(members[j]);
                        for (const kw of lastKws) addFollow(kw, firstJ);
                        if (!isNullable(members[j])) break;
                        j++;
                    }
                }

                // (b) Rule-context follow: if m_i is a SYMBOL referencing a
                //     user rule R, contribute FIRST(suffix) to FOLLOW(R).
                const member = unwrap(members[i]);
                if (member && member.type === 'SYMBOL') {
                    const refName = member.name;
                    if (rules[refName] && !isKeywordSymbol(refName)) {
                        let j = i + 1;
                        let suffixNullable = true;
                        while (j < members.length) {
                            const firstJ = computeFirst(members[j]);
                            addFollowOfRule(refName, firstJ);
                            if (!isNullable(members[j])) {
                                suffixNullable = false;
                                break;
                            }
                            j++;
                        }
                        // If suffix is fully nullable (or m_i is at the tail),
                        // FOLLOW(enclosing) ⊆ FOLLOW(refName). Recorded as a
                        // dependency, resolved in the fixed-point step.
                        if (suffixNullable) {
                            addSuffixDep(refName, ruleName);
                        }
                    }
                }
            }
            for (const m of members) walkRule(ruleName, m);
            break;
        }

        case 'REPEAT':
        case 'REPEAT1': {
            // LAST(content) followed by FIRST(content) (loop iteration).
            const contentLast  = computeLast(node.content);
            const contentFirst = computeFirst(node.content);
            for (const kw of contentLast) {
                addFollow(kw, contentFirst);
            }

            // If content is a SYMBOL referencing a rule R, every occurrence is
            // also followed by another occurrence — FIRST(content) ⊆ FOLLOW(R).
            const inner = unwrap(node.content);
            if (inner && inner.type === 'SYMBOL') {
                const refName = inner.name;
                if (rules[refName] && !isKeywordSymbol(refName)) {
                    addFollowOfRule(refName, contentFirst);
                    // Plus, FOLLOW of the enclosing rule also flows into it
                    // (since the repeat can end and let the enclosing
                    // continuation take over).
                    addSuffixDep(refName, ruleName);
                }
            }

            walkRule(ruleName, node.content);
            break;
        }

        case 'CHOICE':
            for (const m of node.members) walkRule(ruleName, m);
            break;

        case 'SYMBOL':
            // Handled inline in SEQ/REPEAT cases above.
            break;

        default:
            // STRING / PATTERN / BLANK — nothing to do
            break;
    }
}

// Run the walk on every top-level rule body.
for (const ruleName of Object.keys(rules)) {
    walkRule(ruleName, rules[ruleName]);
    lastKeywordsOfRule[ruleName] = computeLast(rules[ruleName]);
}

// ---------------------------------------------------------------------------
// Step 2: Fixed-point propagation.
//
// Until no set changes:
//   For every rule R:
//     For every enclosing rule E in suffixDeps[R]:
//       FOLLOW(R) := FOLLOW(R) ∪ FOLLOW(E)
//   For every rule R:
//     For every kw in LAST(R):
//       FOLLOW(kw) := FOLLOW(kw) ∪ FOLLOW(R)
// ---------------------------------------------------------------------------

let changed = true;
let iterations = 0;
const maxIterations = 200; // sanity cap
while (changed && iterations < maxIterations) {
    changed = false;
    iterations++;

    // Propagate FOLLOW through suffix-dependency edges.
    for (const [ruleName, parents] of Object.entries(suffixDeps)) {
        for (const parent of parents) {
            const parentFollow = followOfRule[parent];
            if (!parentFollow) continue;
            if (addFollowOfRule(ruleName, parentFollow)) {
                changed = true;
            }
        }
    }

    // Project FOLLOW(rule) onto FOLLOW(kw) for every kw in LAST(rule).
    for (const [ruleName, lastKws] of Object.entries(lastKeywordsOfRule)) {
        const ruleFollow = followOfRule[ruleName];
        if (!ruleFollow || lastKws.size === 0) continue;
        for (const kw of lastKws) {
            if (addFollow(kw, ruleFollow)) {
                changed = true;
            }
        }
    }
}

if (iterations >= maxIterations) {
    console.warn(`⚠ Fixed-point did not converge after ${maxIterations} iterations.`);
}

// ---------------------------------------------------------------------------
// Convert Sets to sorted arrays and strip "keyword_" prefix from values.
// Keys keep the "keyword_" prefix so Lua lookups from a TSNode:type() match.
// ---------------------------------------------------------------------------
const result = {};
for (const [kw, targets] of Object.entries(followSets)) {
    if (targets.size === 0) continue;
    const values = Array.from(targets)
        .map(t => t.replace(/^keyword_/, ''))
        .sort();
    if (values.length > 0) {
        result[kw] = values;
    }
}

// ---------------------------------------------------------------------------
// Emit follow_sets.lua
// ---------------------------------------------------------------------------
const repoRoot  = path.join(__dirname, '..');
const relPath   = path.relative(repoRoot, outPath).replace(/\\/g, '/');

const luaLines = [
    '-- AUTOGENERATED by scripts/gen-follow-sets.js — DO NOT EDIT',
    '-- Source: src/grammar.json',
    `-- Generated: ${new Date().toISOString()}`,
    '--',
    '-- Maps keyword_<prev> -> { list of valid next keywords (without keyword_ prefix) }',
    '-- Used by lua/vim-teradata/sql-autocomplete/treesitter.lua to restrict',
    '-- keyword completion candidates based on what the user just typed.',
    '',
    '---@type table<string, string[]>',
    'return {',
];

const sortedKeys = Object.keys(result).sort();
for (const kw of sortedKeys) {
    const values = result[kw];
    const valuesStr = values.map(v => `"${v}"`).join(', ');
    luaLines.push(`  ${kw} = { ${valuesStr} },`);
}

luaLines.push('}');
luaLines.push('');

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, luaLines.join('\n'), 'utf8');
console.log(`✓ Wrote ${sortedKeys.length} follow-set entries to ${relPath}`);
console.log(`  (${iterations} fixed-point iteration${iterations === 1 ? '' : 's'})`);

// ---------------------------------------------------------------------------
// Optionally emit follow_sets.json (used by the test script)
// ---------------------------------------------------------------------------
if (emitJson) {
    const jsonPath = outPath.replace(/\.lua$/, '.json');
    fs.writeFileSync(jsonPath, JSON.stringify(result, null, 2), 'utf8');
    console.log(`✓ Wrote JSON mirror to ${path.relative(repoRoot, jsonPath)}`);
}
