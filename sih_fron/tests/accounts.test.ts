import { afterEach, expect, it, vi } from "vitest";
import {
  DEMO_ACCOUNT_KEY,
  currentDemoUser,
  decodeAccountSnapshot,
  parseDemoUsers,
  readAccountSnapshot,
  registerDemo,
  saveDemoProfile,
  signInDemo,
  signOutDemo,
  type DemoUser,
} from "../src/features/accounts/demoUsers";
import {
  isAvatarData,
  MAX_AVATAR_BYTES,
  readAvatar,
} from "../src/features/accounts/avatar";
import {
  rankDemoStudents,
  recordedImprovement,
  recordedScore,
} from "../src/features/accounts/statistics";

const teacher: DemoUser = {
  username: "Teacher fixture",
  password: "demo-only",
  role: "teacher",
};
const student: DemoUser = {
  username: "Student fixture",
  password: "demo-only",
  role: "student",
};
const png =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aXF8AAAAASUVORK5CYII=";
function storage(initial: Record<string, string> = {}) {
  const data = new Map(Object.entries(initial));
  return {
    data,
    getItem: vi.fn((key: string) => data.get(key) ?? null),
    setItem: vi.fn((key: string, value: string) => {
      data.set(key, value);
    }),
  };
}
const legacy = (users = [student, teacher], selected = student) =>
  storage({
    users: JSON.stringify(users),
    currentUser: JSON.stringify(selected),
    isAdmin: "true",
  });
const read = (store: ReturnType<typeof storage>) =>
  decodeAccountSnapshot(readAccountSnapshot(store));
afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

it("reads legacy users without writing, then imports them in one write while retaining old keys", () => {
  const store = legacy();
  const before = new Map(store.data);
  expect(read(store)).toEqual({
    version: 1,
    users: [student, teacher],
    currentUsername: student.username,
  });
  expect(store.setItem).not.toHaveBeenCalled();
  signInDemo(store, teacher.username, teacher.password!, true);
  expect(store.setItem).toHaveBeenCalledTimes(1);
  expect(currentDemoUser(read(store))).toEqual(teacher);
  for (const [key, value] of before) expect(store.getItem(key)).toBe(value);
});

it("does not seed an administrator or trust unrelated legacy admin/session flags", () => {
  const store = storage({
    isAdmin: "true",
    adminName: "admin",
    currentUser: "{broken",
  });
  expect(read(store)).toEqual({ version: 1, users: [], currentUsername: null });
  expect(store.setItem).not.toHaveBeenCalled();
  expect(() => signInDemo(store, "admin", "1234", true)).toThrow(/No matching/);
  expect(store.setItem).not.toHaveBeenCalled();
  const mismatch = legacy([student], teacher);
  expect(currentDemoUser(read(mismatch))).toBeNull();
});

it("registration creates one normalized record/session without fabricated scores or badges", () => {
  const store = storage();
  const user = registerDemo(store, "  New fixture  ", "demo-only", "student");
  expect(user).toEqual({
    username: "New fixture",
    password: "demo-only",
    role: "student",
  });
  expect(store.setItem).toHaveBeenCalledTimes(1);
  expect(currentDemoUser(read(store))).toEqual(user);
  for (const username of [" ", "x".repeat(81), "New fixture"])
    expect(() =>
      registerDemo(store, username, "demo-only", "student"),
    ).toThrow();
  expect(() => registerDemo(store, "a", "", "student")).toThrow();
  expect(() => registerDemo(store, "a", "x".repeat(129), "student")).toThrow();
  expect(() =>
    registerDemo(store, "a", "demo-only", "admin" as never),
  ).toThrow();
  expect(store.setItem).toHaveBeenCalledTimes(1);
});

it("both sign-in modes use one active record and cannot bypass the teacher check", () => {
  const store = legacy();
  expect(() =>
    signInDemo(store, student.username, student.password!, true),
  ).toThrow(/teacher/);
  expect(() => signInDemo(store, teacher.username, "wrong", true)).toThrow();
  expect(store.setItem).not.toHaveBeenCalled();
  expect(signInDemo(store, teacher.username, teacher.password!, true)).toEqual(
    teacher,
  );
  signOutDemo(store);
  expect(currentDemoUser(read(store))).toBeNull();
  // A stale full legacy session cannot override the newer signed-out state.
  expect(store.getItem("currentUser")).toBe(JSON.stringify(student));
  expect(signInDemo(store, student.username, student.password!)).toEqual(
    student,
  );
});

it("legacy whitespace names remain sign-in compatible without confusing similarly named users", () => {
  const spaced = { ...student, username: " Student fixture " };
  const store = legacy([student, spaced], student);
  expect(signInDemo(store, spaced.username, spaced.password!).username).toBe(
    spaced.username,
  );
});

it("profile saves rename the record and active identity atomically while preserving stored metrics", () => {
  const original: DemoUser = {
    ...student,
    totalQuizzes: 2,
    averageScore: 75,
    badges: ["Existing demo badge"],
    improvement: "5%",
    level: "Legacy demo",
  };
  const store = legacy([original, teacher], original);
  const saved = saveDemoProfile(store, original, {
    username: " Renamed fixture ",
    email: " student@example.test ",
    avatar: png,
  });
  expect(saved).toEqual({
    ...original,
    username: "Renamed fixture",
    email: "student@example.test",
    avatar: png,
  });
  expect(store.setItem).toHaveBeenCalledTimes(1);
  expect(read(store)).toEqual({
    version: 1,
    users: [saved, teacher],
    currentUsername: saved.username,
  });
  expect(signInDemo(store, saved.username, "demo-only")).toEqual(saved);
  expect(() => signInDemo(store, student.username, "demo-only")).toThrow();
});

it("profile collision, invalid fields and stale drafts never overwrite the latest record", () => {
  const store = legacy();
  for (const changes of [
    { username: teacher.username },
    { username: " " },
    { username: student.username, email: "bad" },
    {
      username: student.username,
      avatar: "https://untrusted.example/avatar.svg",
    },
  ])
    expect(() => saveDemoProfile(store, student, changes)).toThrow();
  expect(store.setItem).not.toHaveBeenCalled();
  const saved = saveDemoProfile(store, student, {
    username: student.username,
    email: "new@example.test",
  });
  expect(() => saveDemoProfile(store, student, { username: "stale" })).toThrow(
    /changed in another view/,
  );
  expect(currentDemoUser(read(store))).toEqual(saved);
});

it("storage read/write failure leaves the previous record intact and never reports partial success", () => {
  const store = legacy();
  const before = new Map(store.data);
  store.setItem.mockImplementation(() => {
    throw new DOMException("Quota exceeded", "QuotaExceededError");
  });
  expect(() => registerDemo(store, "new", "demo-only", "student")).toThrow(
    /could not save/,
  );
  expect(() => saveDemoProfile(store, student, { username: "new" })).toThrow(
    /could not save/,
  );
  expect(() => signInDemo(store, student.username, "demo-only")).toThrow(
    /could not save/,
  );
  expect(() => signOutDemo(store)).toThrow(/could not save/);
  expect(store.data).toEqual(before);
  store.getItem.mockImplementation(() => {
    throw new DOMException("Blocked", "SecurityError");
  });
  expect(() => signInDemo(store, student.username, "demo-only")).toThrow(
    /unavailable/,
  );
});

it("rejects malformed, duplicate and unsupported stored data without overwriting it", () => {
  for (const value of [
    "{broken",
    JSON.stringify({ version: 2, users: [], currentUsername: null }),
    JSON.stringify({
      version: 1,
      users: [student, student],
      currentUsername: student.username,
    }),
    JSON.stringify({
      version: 1,
      users: [student],
      currentUsername: "missing",
    }),
    JSON.stringify({
      version: 1,
      users: [{ ...student, badges: {} }],
      currentUsername: student.username,
    }),
  ]) {
    const store = storage({ [DEMO_ACCOUNT_KEY]: value });
    expect(() => registerDemo(store, "new", "demo-only", "student")).toThrow(
      /not overwritten/,
    );
    expect(store.getItem(DEMO_ACCOUNT_KEY)).toBe(value);
    expect(store.setItem).not.toHaveBeenCalled();
  }
  for (const value of ["{broken", "{}", JSON.stringify([student, null])]) {
    const store = storage({ users: value });
    expect(() => registerDemo(store, "new", "demo-only", "student")).toThrow();
    expect(store.getItem("users")).toBe(value);
  }
});

it("the read-only parser excludes unsafe known-field types rather than allowing render crashes", () => {
  for (const patch of [
    { username: " " },
    { role: "admin" },
    { email: {} },
    { avatar: [] },
    { totalQuizzes: -1 },
    { totalQuizzes: 1.5 },
    { averageScore: 101 },
    { averageScore: "50%" },
    { badges: [{}] },
    { improvement: {} },
  ])
    expect(parseDemoUsers(JSON.stringify([{ ...student, ...patch }]))).toEqual(
      [],
    );
  expect(parseDemoUsers(JSON.stringify([student]))).toEqual([student]);
});

it("missing results stay unranked and existing zero scores/badges are represented honestly", () => {
  const high: DemoUser = {
    ...student,
    username: "high",
    totalQuizzes: 3,
    averageScore: 90,
  };
  const zero: DemoUser = {
    ...student,
    username: "zero",
    totalQuizzes: 1,
    averageScore: 0,
  };
  const noAttempts: DemoUser = {
    ...student,
    username: "none",
    totalQuizzes: 0,
    averageScore: 100,
  };
  const users = [student, teacher, zero, noAttempts, high];
  expect(
    rankDemoStudents(users).map(({ user, rank }) => [user.username, rank]),
  ).toEqual([
    ["high", 1],
    ["zero", 2],
    [student.username, null],
    ["none", null],
  ]);
  expect(users[0]).toBe(student);
  expect(recordedScore(student)).toBe("—");
  expect(recordedScore(zero)).toBe("0%");
  expect(recordedImprovement(student)).toBe("—");
  expect(recordedImprovement({ ...student, improvement: "5%" })).toBe("5%");
});

it("only bounded inline raster signatures are accepted for avatars, never remote/blob/SVG URLs", () => {
  expect(isAvatarData(png)).toBe(true);
  for (const value of [
    null,
    "",
    "blob:http://test/old",
    "https://example.test/a.png",
    "data:image/svg+xml;base64,PHN2Zz4=",
    "data:image/png;base64,bm90LWEtcG5n",
    `data:image/png;base64,${"a".repeat(MAX_AVATAR_BYTES * 2)}`,
  ])
    expect(isAvatarData(value)).toBe(false);
});

class Reader {
  static LOADING = 1;
  static latest: Reader;
  readyState = 1;
  result: string | ArrayBuffer | null = png;
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  onabort: (() => void) | null = null;
  abort = vi.fn();
  readAsDataURL = vi.fn();
  constructor() {
    Reader.latest = this;
  }
}
class Preview {
  static latest: Preview;
  naturalWidth = 100;
  naturalHeight = 100;
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  src = "";
  removeAttribute = vi.fn();
  constructor() {
    Preview.latest = this;
  }
}
function fakeImage() {
  vi.useFakeTimers();
  vi.stubGlobal("FileReader", Reader);
  vi.stubGlobal("Image", Preview);
}
const file = () =>
  new File([new Uint8Array([1])], "fixture.png", { type: "image/png" });

it("validates decoded dimensions and releases image/reader resources after success", async () => {
  fakeImage();
  const task = readAvatar(file(), new AbortController().signal);
  Reader.latest.onload!();
  Preview.latest.onload!();
  await expect(task).resolves.toBe(png);
  expect(Preview.latest.removeAttribute).toHaveBeenCalledWith("src");
  expect(Reader.latest.onload).toBeNull();
  expect(Preview.latest.onload).toBeNull();
  expect(vi.getTimerCount()).toBe(0);
});

it("rejects invalid types/signatures/dimensions and undecodable images without changing a profile", async () => {
  fakeImage();
  await expect(
    readAvatar(
      new File(["svg"], "bad.svg", { type: "image/svg+xml" }),
      new AbortController().signal,
    ),
  ).rejects.toThrow(/PNG, JPEG or WebP/);
  await expect(
    readAvatar(
      new File([new Uint8Array(MAX_AVATAR_BYTES + 1)], "large.png", {
        type: "image/png",
      }),
      new AbortController().signal,
    ),
  ).rejects.toThrow(/256 KiB/);
  const invalid = readAvatar(file(), new AbortController().signal);
  Reader.latest.result = "data:image/png;base64,YmFk";
  Reader.latest.onload!();
  await expect(invalid).rejects.toThrow(/not a supported/);
  const large = readAvatar(file(), new AbortController().signal);
  Reader.latest.onload!();
  Preview.latest.naturalWidth = 4097;
  Preview.latest.onload!();
  await expect(large).rejects.toThrow(/dimensions/);
  const badImage = readAvatar(file(), new AbortController().signal);
  Reader.latest.onload!();
  Preview.latest.onerror!();
  await expect(badImage).rejects.toThrow(/decoded/);
  expect(vi.getTimerCount()).toBe(0);
});

it("bounds stalled image work and cancels pending readers without late updates", async () => {
  fakeImage();
  const stalled = readAvatar(file(), new AbortController().signal);
  const rejected = expect(stalled).rejects.toThrow(/too long/);
  await vi.advanceTimersByTimeAsync(10000);
  await rejected;
  const controller = new AbortController();
  const cancelled = readAvatar(file(), controller.signal);
  controller.abort();
  await expect(cancelled).rejects.toMatchObject({ name: "AbortError" });
  expect(Reader.latest.abort).toHaveBeenCalledTimes(1);
  expect(Reader.latest.onload).toBeNull();
  expect(vi.getTimerCount()).toBe(0);
  await expect(readAvatar(file(), controller.signal)).rejects.toMatchObject({
    name: "AbortError",
  });
});
