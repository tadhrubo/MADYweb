import { popSticker, slideFood, drawDoodle, textUpward, textUpwardContainer, motionVariants } from '../src/utils/motionVariants.ts';
import assert from 'node:assert';

console.log('=== VERIFYING MOTION VARIANTS UTILITY ===\n');

// 1. Verify Dictionary & Exports
assert(popSticker, 'popSticker must be defined');
assert(slideFood, 'slideFood must be defined');
assert(drawDoodle, 'drawDoodle must be defined');
assert(textUpward, 'textUpward must be defined');
assert(motionVariants, 'motionVariants dictionary must be defined');
assert.strictEqual(motionVariants.popSticker, popSticker);
assert.strictEqual(motionVariants.slideFood, slideFood);
assert.strictEqual(motionVariants.drawDoodle, drawDoodle);
assert.strictEqual(motionVariants.textUpward, textUpward);
console.log('✓ All 4 required variants and motionVariants dictionary exported successfully');

// 2. popSticker checks
const popHidden = typeof popSticker.hidden === 'function' ? popSticker.hidden() : popSticker.hidden;
const popVisible = typeof popSticker.visible === 'function' ? popSticker.visible() : popSticker.visible;
assert.strictEqual(popHidden.scale, 0.8, 'popSticker hidden scale should be 0.8');
assert.strictEqual(popHidden.opacity, 0, 'popSticker hidden opacity should be 0');
assert.strictEqual(popHidden.rotate, -5, 'popSticker hidden rotate should have -5deg rotation');
assert.strictEqual(popVisible.scale, 1, 'popSticker visible scale should be 1');
assert.strictEqual(popVisible.opacity, 1, 'popSticker visible opacity should be 1');
assert.strictEqual(popVisible.rotate, 0, 'popSticker visible rotate should be 0 by default');
assert.strictEqual(popVisible.transition?.type, 'spring', 'popSticker should use spring physics');
console.log('✓ popSticker: scale 0.8 -> 1, rotation +/- 5 deg, spring bounce validated');

// 3. slideFood checks
const slideHidden = typeof slideFood.hidden === 'function' ? slideFood.hidden() : slideFood.hidden;
const slideVisible = typeof slideFood.visible === 'function' ? slideFood.visible() : slideFood.visible;
assert.strictEqual(slideHidden.opacity, 0, 'slideFood hidden opacity should be 0');
assert(slideHidden.y !== undefined, 'slideFood hidden should have translateY offset');
assert.strictEqual(slideVisible.opacity, 1, 'slideFood visible opacity should be 1');
assert.strictEqual(slideVisible.x, 0, 'slideFood visible x should be 0');
assert.strictEqual(slideVisible.y, 0, 'slideFood visible y should be 0');
assert(slideVisible.transition?.ease !== undefined, 'slideFood should have ease-out transition');
console.log('✓ slideFood: translate offset -> 0, opacity 0 -> 1, gentle ease-out curve validated');

// 4. drawDoodle checks
const drawHidden = typeof drawDoodle.hidden === 'function' ? drawDoodle.hidden() : drawDoodle.hidden;
const drawVisible = typeof drawDoodle.visible === 'function' ? drawDoodle.visible() : drawDoodle.visible;
assert.strictEqual(drawHidden.pathLength, 0, 'drawDoodle hidden pathLength should be 0');
assert.strictEqual(drawVisible.pathLength, 1, 'drawDoodle visible pathLength should be 1');
console.log('✓ drawDoodle: pathLength 0 -> 1 for SVG underlines and rays validated');

// 5. textUpward checks
const textHidden = typeof textUpward.hidden === 'function' ? textUpward.hidden() : textUpward.hidden;
const textVisible = typeof textUpward.visible === 'function' ? textUpward.visible() : textUpward.visible;
assert.strictEqual(textHidden.opacity, 0, 'textUpward hidden opacity should be 0');
assert(textHidden.y !== undefined, 'textUpward hidden y should be defined');
assert.strictEqual(textVisible.y, '0%', 'textUpward visible y should be 0%');
assert.strictEqual(textVisible.opacity, 1, 'textUpward visible opacity should be 1');
console.log('✓ textUpward: translateY reveal for typography headers validated');

// 6. Staggered Container check
assert(textUpwardContainer, 'textUpwardContainer should be defined');
const containerVisible = typeof textUpwardContainer.visible === 'function' ? textUpwardContainer.visible() : textUpwardContainer.visible;
assert(containerVisible.transition?.staggerChildren !== undefined, 'textUpwardContainer should have staggerChildren');
console.log('✓ textUpwardContainer: staggerChildren orchestration validated');

console.log('\n=== ALL MOTION VARIANTS ASSERTIONS PASSED ===');
