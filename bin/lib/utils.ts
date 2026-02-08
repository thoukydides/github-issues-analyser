// GitHub action
// Copyright © 2026 Alexander Thoukydides

import assert from 'assert';

// Type assertions
export function assertIsDefined<Type>(value: Type): asserts value is NonNullable<Type> {
    assert.notStrictEqual(value, undefined);
    assert.notStrictEqual(value, null);
}

// Format a counted noun (handling most regular cases automatically)
export function plural(count: number, noun: string | [string, string], showCount = true): string {
    const [singular, plural] = Array.isArray(noun) ? noun : [noun, ''];
    noun = count === 1 ? singular : plural;
    if (!noun) {
        // Apply regular rules
        const rules: [string, string, number][] = [
            ['on$',                 'a',   2], // phenomenon/phenomena criterion/criteria
            ['us$',                 'i',   1], //     cactus/cacti         focus/foci
            ['[^aeiou]y$',          'ies', 1], //        cty/cites         puppy/puppies
            ['(ch|is|o|s|sh|x|z)$', 'es',  0], //       iris/irises        truss/trusses
            ['',                    's',   0]  //        cat/cats          house/houses
        ];
        const rule = rules.find(([ending]) => new RegExp(ending, 'i').test(singular));
        assertIsDefined(rule);
        const matchCase = (s: string): string => singular === singular.toUpperCase() ? s.toUpperCase() : s;
        noun = singular.substring(0, singular.length - rule[2]).concat(matchCase(rule[1]));
    }
    return showCount ? `${count} ${noun}` : noun;
}