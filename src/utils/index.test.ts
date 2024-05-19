import { describe, it, expect } from "vitest";
import { countWords } from ".";

describe("countWord", () => {
    it("should return the correct number of words for a simple sentence", () => {
        const text = "Hello world";
        const result = countWords(text);
        expect(result).toBe(2);
    });

    it("should handle punctuation correctly", () => {
        const text = "Hello, world!";
        const result = countWords(text);
        expect(result).toBe(2);
    });

    it("should handle multiple spaces correctly", () => {
        const text = "Hello   world";
        const result = countWords(text);
        expect(result).toBe(2);
    });

    it("should handle an empty string", () => {
        const text = "";
        const result = countWords(text);
        expect(result).toBe(0);
    });

    it("should handle a string with only spaces", () => {
        const text = "    ";
        const result = countWords(text);
        expect(result).toBe(0);
    });

    it("should handle a string with only punctuations and whitespaces", () => {
        const text = "                  ;'- ";
        const result = countWords(text);
        expect(result).toBe(0);
    });

    it("should handle a string with mixed casing", () => {
        const text = "Hello HELLO hello";
        const result = countWords(text);
        expect(result).toBe(3);
    });

    it("should handle a complex sentence", () => {
        const text = "Hello, hello! How are you? Are you doing well? Hello!";
        const result = countWords(text);
        expect(result).toBe(10);
    });
});
