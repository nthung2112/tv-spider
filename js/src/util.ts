export function compareTwoStrings(first: string, second: string): number {
  if ((first = first.replace(/\s+/g, '')) === (second = second.replace(/\s+/g, ''))) return 1;
  if (first.length < 2 || second.length < 2) return 0;
  const firstBigrams: Map<string, number> = new Map();
  for (let i = 0; i < first.length - 1; i++) {
    const bigram = first.substring(i, i + 2);
    const count = firstBigrams.has(bigram) ? firstBigrams.get(bigram)! + 1 : 1;
    firstBigrams.set(bigram, count);
  }
  let intersectionSize = 0;
  for (let i = 0; i < second.length - 1; i++) {
    const bigram = second.substring(i, i + 2);
    const count = firstBigrams.has(bigram) ? firstBigrams.get(bigram)! : 0;
    if (count > 0) {
      firstBigrams.set(bigram, count - 1);
      intersectionSize++;
    }
  }
  return (2 * intersectionSize) / (first.length + second.length - 2);
}

interface MatchRating {
  target: string;
  rating: number;
}

interface BestMatch {
  ratings: MatchRating[];
  bestMatch: MatchRating;
  bestMatchIndex: number;
}

export function findBestMatch(mainString: string, targetStrings: string[]): BestMatch {
  const ratings: MatchRating[] = [];
  let bestMatchIndex = 0;
  for (let i = 0; i < targetStrings.length; i++) {
    const currentTargetString = targetStrings[i];
    const currentRating = compareTwoStrings(mainString, currentTargetString);
    ratings.push({ target: currentTargetString, rating: currentRating });
    if (currentRating > ratings[bestMatchIndex].rating) {
      bestMatchIndex = i;
    }
  }
  return {
    ratings: ratings,
    bestMatch: ratings[bestMatchIndex],
    bestMatchIndex: bestMatchIndex,
  };
}

interface LCSResult {
  length: number;
  sequence: string;
  offset: number;
}

function lcs(str1: string, str2: string): LCSResult {
  if (!str1 || !str2) return { length: 0, sequence: '', offset: 0 };
  let sequence = '';
  const str1Length = str1.length;
  const str2Length = str2.length;
  const num: number[][] = new Array(str1Length).fill(null).map(() => new Array(str2Length).fill(0));
  let maxlen = 0;
  let lastSubsBegin = 0;
  let thisSubsBegin = 0;
  for (let i = 0; i < str1Length; i++) {
    for (let j = 0; j < str2Length; j++) {
      if (str1[i] !== str2[j]) {
        num[i][j] = 0;
      } else {
        if (i === 0 || j === 0) {
          num[i][j] = 1;
        } else {
          num[i][j] = 1 + num[i - 1][j - 1];
        }
        if (num[i][j] > maxlen) {
          maxlen = num[i][j];
          thisSubsBegin = i - num[i][j] + 1;
          if (lastSubsBegin === thisSubsBegin) {
            sequence += str1[i];
          } else {
            lastSubsBegin = thisSubsBegin;
            sequence = str1.substr(lastSubsBegin, i + 1 - lastSubsBegin);
          }
        }
      }
    }
  }
  return { length: maxlen, sequence: sequence, offset: thisSubsBegin };
}

interface LCSMatch {
  target: string;
  lcs: LCSResult;
}

interface BestLCSMatch {
  allLCS: LCSMatch[];
  bestMatch: LCSMatch;
  bestMatchIndex: number;
}

export function findBestLCS(mainString: string, targetStrings: string[]): BestLCSMatch {
  const results: LCSMatch[] = [];
  let bestMatchIndex = 0;
  for (let i = 0; i < targetStrings.length; i++) {
    const currentTargetString = targetStrings[i];
    const currentLCS = lcs(mainString, currentTargetString);
    results.push({ target: currentTargetString, lcs: currentLCS });
    if (currentLCS.length > results[bestMatchIndex].lcs.length) {
      bestMatchIndex = i;
    }
  }
  return {
    allLCS: results,
    bestMatch: results[bestMatchIndex],
    bestMatchIndex: bestMatchIndex,
  };
}

export function stringToSlug(str: string): string {
  const from = 'àáãảạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệđùúủũụưừứửữựòóỏõọôồốổỗộơờớởỡợìíỉĩịäëïîöüûñçýỳỹỵỷ';
  const to = 'aaaaaaaaaaaaaaaaaeeeeeeeeeeeduuuuuuuuuuuoooooooooooooooooiiiiiaeiiouuncyyyyy';
  for (let i = 0, l = from.length; i < l; i++) {
    str = str.replace(new RegExp(from[i], 'gi'), to[i]);
  }

  str = str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\-]/g, '-')
    .replace(/-+/g, '-');

  return str;
}

export function showDateText(timestamp: number): string {
  return new Date(timestamp).toLocaleString('vi-VN', {
    hour: 'numeric',
    minute: 'numeric',
    day: '2-digit',
    month: '2-digit',
  });
}
