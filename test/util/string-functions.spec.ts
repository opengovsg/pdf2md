import { expect, describe, it } from 'vitest'

import {
  hasUpperCaseCharacterInMiddleOfWord,
  normalizedCharCodeArray,
  removeLeadingWhitespaces,
  removeTrailingWhitespaces,
  prefixAfterWhitespace,
  suffixBeforeWhitespace,
  charCodeArray,
  isListItem,
  isNumberedListItem,
  wordMatch,
  hasOnly,
  isListItemCharacter,
} from "../../lib/util/string-functions";

describe("functions: hasUpperCaseCharacterInMiddleOfWord", () => {
  it("single word", () => {
    expect(hasUpperCaseCharacterInMiddleOfWord("word")).toBe(false);
    expect(hasUpperCaseCharacterInMiddleOfWord("Word")).toBe(false);

    expect(hasUpperCaseCharacterInMiddleOfWord("wOrd")).toBe(true);
    expect(hasUpperCaseCharacterInMiddleOfWord("woRd")).toBe(true);
    expect(hasUpperCaseCharacterInMiddleOfWord("worD")).toBe(true);
  });

  it("multi words", () => {
    expect(hasUpperCaseCharacterInMiddleOfWord("Hello World")).toBe(false);
    expect(hasUpperCaseCharacterInMiddleOfWord("hello world")).toBe(false);

    expect(hasUpperCaseCharacterInMiddleOfWord("HelloWorld")).toBe(true);
    expect(hasUpperCaseCharacterInMiddleOfWord("HellO World")).toBe(true);
    expect(hasUpperCaseCharacterInMiddleOfWord("Hello WOrld")).toBe(true);
    expect(hasUpperCaseCharacterInMiddleOfWord("Hello WorlD")).toBe(true);
  });

  it("with numbers", () => {
    expect(hasUpperCaseCharacterInMiddleOfWord("high5")).toBe(false);
    expect(hasUpperCaseCharacterInMiddleOfWord("High5")).toBe(false);
    expect(hasUpperCaseCharacterInMiddleOfWord("High 5")).toBe(false);
    expect(hasUpperCaseCharacterInMiddleOfWord("High 5th")).toBe(false);
    expect(hasUpperCaseCharacterInMiddleOfWord("High 5'sec")).toBe(false);
    expect(hasUpperCaseCharacterInMiddleOfWord("Type-0-mat")).toBe(false);

    expect(hasUpperCaseCharacterInMiddleOfWord("HigH 5")).toBe(true);
    expect(hasUpperCaseCharacterInMiddleOfWord("High 5E")).toBe(true);
    expect(hasUpperCaseCharacterInMiddleOfWord("High 5 or tWo down")).toBe(
      true
    );
    expect(hasUpperCaseCharacterInMiddleOfWord("High 5'Sec")).toBe(true);
  });
});

describe("functions: removeLeadingWhitespaces", () => {
  it("No Removes", () => {
    expect(removeLeadingWhitespaces(".")).toBe(".");
    expect(removeLeadingWhitespaces(". ")).toBe(". ");
    expect(removeLeadingWhitespaces(". . ")).toBe(". . ");
  });

  it("Removes", () => {
    expect(removeLeadingWhitespaces(" .")).toBe(".");
    expect(removeLeadingWhitespaces("  .")).toBe(".");
    expect(removeLeadingWhitespaces("  . ")).toBe(". ");
    expect(removeLeadingWhitespaces("  . . ")).toBe(". . ");
  });
});

describe("functions: removeTrailingWhitespaces", () => {
  it("No Removes", () => {
    expect(removeTrailingWhitespaces(".")).toBe(".");
    expect(removeTrailingWhitespaces(" .")).toBe(" .");
    expect(removeTrailingWhitespaces(" . .")).toBe(" . .");
  });

  it("Removes", () => {
    expect(removeTrailingWhitespaces(". ")).toBe(".");
    expect(removeTrailingWhitespaces(".  ")).toBe(".");
    expect(removeTrailingWhitespaces(" . ")).toBe(" .");
    expect(removeTrailingWhitespaces(" . .  ")).toBe(" . .");
  });
});

describe("functions: prefixAfterWhitespace", () => {
  it("Basic", () => {
    expect(prefixAfterWhitespace("1", "2")).toBe("12");
    expect(prefixAfterWhitespace(" 1", "2")).toBe(" 12");
    expect(prefixAfterWhitespace(" 1", " 2")).toBe("  12");
    expect(prefixAfterWhitespace("1", " 2")).toBe(" 12");
    expect(prefixAfterWhitespace("1", "  2")).toBe(" 12");
  });
});

describe("functions: suffixBeforeWhitespace", () => {
  it("Basic", () => {
    expect(suffixBeforeWhitespace("A ", ".")).toBe("A. ");
    expect(suffixBeforeWhitespace(" A", ".")).toBe(" A.");
    expect(suffixBeforeWhitespace(" A ", " .")).toBe(" A . ");
    expect(suffixBeforeWhitespace("A", " .")).toBe("A .");
    expect(suffixBeforeWhitespace("A  ", ".")).toBe("A. ");
  });
});

describe("functions: charCodeArray", () => {
  it("Charcodes", () => {
    expect(charCodeArray(".")).toHaveLength(1);
    expect(charCodeArray(".")).toContain(46);
  });

  it("Convert Back", () => {
    expect(String.fromCharCode.apply(null, charCodeArray("word"))).toBe("word");
    expect(String.fromCharCode.apply(null, charCodeArray("WORD"))).toBe("WORD");
    expect(String.fromCharCode.apply(null, charCodeArray("a word"))).toBe(
      "a word"
    );
  });
});

describe("functions: normalizedCharCodeArray", () => {
  it("No Change", () => {
    expect(
      String.fromCharCode.apply(null, normalizedCharCodeArray("WORD"))
    ).toBe("WORD");
    expect(
      String.fromCharCode.apply(null, normalizedCharCodeArray("WORD23"))
    ).toBe("WORD23");
  });

  it("lowecaseToUpperCase", () => {
    expect(
      String.fromCharCode.apply(null, normalizedCharCodeArray("word"))
    ).toBe("WORD");
    expect(
      String.fromCharCode.apply(null, normalizedCharCodeArray("WoRd"))
    ).toBe("WORD");
    expect(
      String.fromCharCode.apply(null, normalizedCharCodeArray("word23"))
    ).toBe("WORD23");
  });

  it("RemoveWhiteSpace", () => {
    expect(
      String.fromCharCode.apply(null, normalizedCharCodeArray("A WORD"))
    ).toBe("AWORD");
    expect(
      String.fromCharCode.apply(
        null,
        normalizedCharCodeArray("SOME LITTLE SENTENCE.")
      )
    ).toBe("SOMELITTLESENTENCE");
  });

  it("All", () => {
    expect(
      String.fromCharCode.apply(null, normalizedCharCodeArray("a word"))
    ).toBe("AWORD");
    expect(
      String.fromCharCode.apply(null, normalizedCharCodeArray("WoRd 4 u"))
    ).toBe("WORD4U");
    expect(
      String.fromCharCode.apply(
        null,
        normalizedCharCodeArray("Some little sentence.")
      )
    ).toBe("SOMELITTLESENTENCE");
  });
});

describe("functions: isListItem", () => {
  it("Match", () => {
    expect(isListItem("- my text")).toBe(true);
    expect(isListItem("- my text -")).toBe(true);
    expect(isListItem(" - my text")).toBe(true);
    expect(isListItem("  - my text")).toBe(true);
    expect(isListItem(" -  my text")).toBe(true);

    expect(isListItem("• my text")).toBe(true);
    expect(isListItem(" • my text")).toBe(true);
    expect(isListItem("  • my text")).toBe(true);

    expect(isListItem("– my text")).toBe(true);
    expect(isListItem(" – my text")).toBe(true);
  });

  it("No Match", () => {
    expect(isListItem("my text")).toBe(false);
    expect(isListItem("-my text")).toBe(false);
    expect(isListItem("•my text")).toBe(false);
    expect(isListItem(" -my text")).toBe(false);
  });
});

describe("functions: isNumberedListItem", () => {
  it("Match", () => {
    expect(isNumberedListItem("1. my text")).toBe(true);
    expect(isNumberedListItem("2. my text")).toBe(true);
    expect(isNumberedListItem("23. my text")).toBe(true);
    expect(isNumberedListItem("23.   my text")).toBe(true);
    expect(isNumberedListItem(" 23.   my text")).toBe(true);
    expect(isNumberedListItem("  23.   my text")).toBe(true);
  });

  it("No Match", () => {
    expect(isNumberedListItem("1two")).toBe(false);
    expect(isNumberedListItem("1 two")).toBe(false);
    expect(isNumberedListItem("1.two")).toBe(false);
  });
});

describe("functions: wordsMatch", () => {
  it("Match", () => {
    expect(wordMatch("text 1", "text 1")).toBe(1.0);
    expect(wordMatch("text 1", "text 2")).toBe(0.5);
    expect(wordMatch("text 1", "text 1 2")).toBe(0.6666666666666666);
    expect(wordMatch("text 1 2 3", "text 1 4 5")).toBe(0.5);
    expect(wordMatch("text 1 2 3", "5 1 4 text")).toBe(0.5);
    expect(wordMatch("text 1 2 3", "text")).toBe(0.25);

    expect(wordMatch("text", "test")).toBe(0.0);

    expect(
      wordMatch(
        "inStruCtionS for the full Moon proCeSS",
        "Instructions for the Full Moon Process"
      )
    ).toBe(1.0);
  });
});

describe("functions: hasOnly", () => {
  it("Match", () => {
    expect(hasOnly("a", "a")).toBe(true);
    expect(hasOnly("aaaa", "a")).toBe(true);
  });

  it("No Match", () => {
    expect(hasOnly("abc", "a")).toBe(false);
    expect(hasOnly("abc", "")).toBe(false);
    expect(hasOnly("abc", "ab")).toBe(false);
    expect(hasOnly("abc", "1")).toBe(false);
  });
});

describe("functions: isListItemCharacter", () => {
  it("Match", () => {
    expect(isListItemCharacter("-")).toBe(true);
    expect(isListItemCharacter("•")).toBe(true);
    expect(isListItemCharacter("–")).toBe(true);
  });

  it("No Match", () => {
    expect(isListItemCharacter("--")).toBe(false);
    expect(isListItemCharacter("••")).toBe(false);
    expect(isListItemCharacter("––")).toBe(false);
    expect(isListItemCharacter("")).toBe(false);
    expect(isListItemCharacter("a")).toBe(false);
    expect(isListItemCharacter("abc")).toBe(false);
  });
});
