import { schemas } from './schemas.js';

export function validateItem(collectionName, data) {
  const schema = schemas[collectionName];
  if (!schema) {
    return { valid: false, errors: [`Unknown collection: ${collectionName}`] };
  }

  const errors = [];

  for (const field of schema.fields) {
    const value = getNestedValue(data, field.name);

    if (field.required && !value && value !== false && value !== 0) {
      errors.push(`Field "${field.label}" is required`);
      continue;
    }

    if (value === undefined || value === null || value === '') {
      continue;
    }

    switch (field.type) {
      case 'text':
      case 'textarea':
        if (typeof value !== 'string') {
          errors.push(`Field "${field.label}" must be a string`);
        } else if (value.length > 50000) {
          errors.push(`Field "${field.label}" is too long (max 50000 chars)`);
        }
        break;

      case 'number':
        if (typeof value !== 'number' && isNaN(Number(value))) {
          errors.push(`Field "${field.label}" must be a number`);
        }
        break;

      case 'checkbox':
        break;

      case 'select':
        if (field.options) {
          const validValues = field.options.map(opt => typeof opt === 'object' ? opt.value : opt);
          if (!validValues.includes(value)) {
            errors.push(`Field "${field.label}" has invalid value`);
          }
        }
        break;

      case 'array':
        if (!Array.isArray(value)) {
          errors.push(`Field "${field.label}" must be an array`);
        }
        break;

      case 'offices':
        if (!Array.isArray(value)) {
          errors.push(`Field "${field.label}" must be an array`);
        }
        break;

      case 'image':
        if (typeof value !== 'string') {
          errors.push(`Field "${field.label}" must be a string path`);
        } else if (!isValidImagePath(value)) {
          errors.push(`Field "${field.label}" has invalid image path`);
        }
        break;
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

function getNestedValue(obj, path) {
  return path.split('.').reduce((acc, part) => acc && acc[part], obj);
}

function isValidImagePath(path) {
  if (!path) return true;
  if (path.startsWith('http://') || path.startsWith('https://')) return true;
  if (path.startsWith('/images/')) return true;
  return false;
}

export function sanitizeItem(data) {
  const sanitized = {};
  
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string') {
      sanitized[key] = value.trim();
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      sanitized[key] = sanitizeItem(value);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
}
