// Validate content-model JSON against schemas/content-model/*.schema.json without dependencies.
// Supports the subset the schemas use: type, required, properties, additionalProperties
// (false or a schema), enum, const, pattern, items, minItems, minimum and $ref
// ("#/$defs/x" or "<file>.schema.json#/$defs/x").
//
// Usage: node scripts/content/schema.mjs <schema-name> <file.json> [...]
import fs from 'node:fs';
import {pathToFileURL} from 'node:url';

const DIR = new URL('../../schemas/content-model/', import.meta.url);
const cache = new Map();

export function loadSchema(name) {
  const file = name.endsWith('.json') ? name : `${name}.schema.json`;
  if (!cache.has(file)) cache.set(file, JSON.parse(fs.readFileSync(new URL(file, DIR))));
  return cache.get(file);
}

function resolve(ref, base) {
  const [file, pointer = ''] = ref.split('#');
  const doc = file ? loadSchema(file) : base;
  const node = pointer.split('/').filter(Boolean).reduce((n, key) => n?.[key], doc);
  if (!node) throw new Error(`unresolved $ref ${ref}`);
  return {node, base: doc};
}

const typeOf = v => v === null ? 'null' : Array.isArray(v) ? 'array' : Number.isInteger(v) ? 'integer' : typeof v;
const fits = (v, t) => typeOf(v) === t || (t === 'number' && typeof v === 'number');

function check(value, schema, base, path, errors) {
  if (schema.$ref) {
    const {node, base: next} = resolve(schema.$ref, base);
    return check(value, node, next, path, errors);
  }
  if (schema.type && ![].concat(schema.type).some(t => fits(value, t)))
    return errors.push(`${path}: expected ${[].concat(schema.type).join('|')}, got ${typeOf(value)}`);
  if (schema.enum && !schema.enum.includes(value)) errors.push(`${path}: ${JSON.stringify(value)} not in ${schema.enum.join(', ')}`);
  if ('const' in schema && value !== schema.const) errors.push(`${path}: must be ${JSON.stringify(schema.const)}`);
  if (typeof value === 'string' && schema.pattern && !new RegExp(schema.pattern, 'u').test(value))
    errors.push(`${path}: ${JSON.stringify(value)} does not match ${schema.pattern}`);
  if (typeof value === 'number' && schema.minimum != null && value < schema.minimum) errors.push(`${path}: below ${schema.minimum}`);
  if (Array.isArray(value)) {
    if (schema.minItems && value.length < schema.minItems) errors.push(`${path}: needs at least ${schema.minItems} item(s)`);
    if (schema.items) value.forEach((v, i) => check(v, schema.items, base, `${path}[${i}]`, errors));
  }
  if (typeOf(value) === 'object') {
    for (const key of schema.required || []) if (!(key in value)) errors.push(`${path}: missing ${key}`);
    for (const [key, v] of Object.entries(value)) {
      if (schema.properties?.[key]) check(v, schema.properties[key], base, `${path}.${key}`, errors);
      else if (schema.additionalProperties === false) errors.push(`${path}: unexpected ${key}`);
      else if (typeof schema.additionalProperties === 'object') check(v, schema.additionalProperties, base, `${path}.${key}`, errors);
    }
  }
}

export function validate(name, value) {
  const schema = loadSchema(name), errors = [];
  check(value, schema, schema, '$', errors);
  return errors;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [name, ...files] = process.argv.slice(2);
  let failed = false;
  for (const file of files) {
    const errors = validate(name, JSON.parse(fs.readFileSync(file)));
    console.log(errors.length ? `✗ ${file}\n  ${errors.join('\n  ')}` : `✓ ${file}`);
    failed ||= errors.length > 0;
  }
  process.exit(failed ? 1 : 0);
}
