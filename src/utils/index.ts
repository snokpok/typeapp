export const sample = (arr: any[]) => {
  const choice = Math.floor(Math.random() * (arr.length - 1));
  return arr[choice];
};

export const similarUpTo = (a: string, b: string): number => {
  const limit = Math.min(a.length, b.length);
  let i = 0;
  for (; i < limit; i++) {
    if (a[i] !== b[i]) break;
  }
  return i;
};

const PUNCTUATIONS_RE = /[.,!?;:(){}[\]"'`~@#$%^&*+=<>|\\\-/]/g;

export const countWords = (text: string) => {
  const cleanText = text.replace(PUNCTUATIONS_RE, "").toLowerCase();
  const words = cleanText.split(/\s+/).filter((el) => el !== "");
  return words.length;
};
