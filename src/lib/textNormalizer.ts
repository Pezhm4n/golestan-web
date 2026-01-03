/**
 * Normalize Persian/Arabic text for robust comparison and matching.
 * Ported from _reference_logic/core/text_normalizer.py::normalize_persian_text
 *
 * Key behaviors:
 * - Unify Arabic/Persian variants of ی / ك → ی / ک
 * - Remove zero-width non-joiner (ZWNJ) and similar invisible chars
 * - Normalize digits and spacing so
 *   "مهندسی کامپیوتر" and "مهندسی‌کامپیوتر" match reliably.
 */
export function normalizeText(text: string): string {
  if (text == null) {
    return '';
  }

  let result = String(text).trim();
  if (!result) {
    return '';
  }

  // Convert Persian/Arabic digits to English digits
  const persianDigits = '۰۱۲۳۴۵۶۷۸۹';
  const arabicDigits = '٠١٢٣٤٥٦٧٨٩';
  const englishDigits = '0123456789';

  const persianToEnglish: Record<string, string> = {};
  const arabicToEnglish: Record<string, string> = {};

  for (let i = 0; i < englishDigits.length; i++) {
    persianToEnglish[persianDigits[i]] = englishDigits[i];
    arabicToEnglish[arabicDigits[i]] = englishDigits[i];
  }

  result = result
    .split('')
    .map((ch) => persianToEnglish[ch] ?? arabicToEnglish[ch] ?? ch)
    .join('');

  // Normalize common Arabic characters to Persian equivalents
  const arabicCharMap: Record<string, string> = {
    'ي': 'ی',
    'ى': 'ی',
    'ئ': 'ی',
    'ك': 'ک',
    'ؤ': 'و',
    'إ': 'ا',
    'أ': 'ا',
    'آ': 'ا',
    'ۀ': 'ه',
    'ة': 'ه',
    'ء': '',
  };

  result = result
    .split('')
    .map((ch) => arabicCharMap[ch] ?? ch)
    .join('');

  // Remove/normalize zero-width and formatting characters
  result = result
    .replace(/\u200c/g, '') // ZWNJ
    .replace(/\u200d/g, '') // ZWJ
    .replace(/ـ/g, '') // kashida
    .replace(/‌/g, '') // explicit ZWNJ used in some fonts
    .replace(/‎/g, '') // LRM
    .replace(/‏/g, ''); // RLM

  // Normalize various dash/underscore characters to spaces
  result = result
    .replace(/–/g, ' ')
    .replace(/—/g, ' ')
    .replace(/-/g, ' ')
    .replace(/_/g, ' ');

  // Strip quotes
  result = result.replace(/["']/g, '');

  // Remove bracketed/parenthetical annotations entirely
  result = result
    .replace(/\([^)]*\)/g, ' ')
    .replace(/\[[^\]]*]/g, ' ')
    .replace(/\{[^}]*}/g, ' ');

  // Collapse whitespace
  result = result.replace(/\s+/g, ' ').trim();

  // Remove remaining bracket and punctuation characters used in Persian
  result = result
    .replace(/[()\[\]{}()]/g, '')
    .replace(/[،؛:؛٬«»]/g, '');

  // Fix common OCR/typo variant
  result = result.replace(/اسالم/g, 'اسلام');

  return result.toLowerCase();
}