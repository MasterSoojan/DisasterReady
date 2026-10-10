import { isAvatarData } from "./avatar";
// Browser-only prototype records. Passwords/roles here provide NO secure authentication.
export interface DemoUser {
  username: string;
  password?: string;
  role: "student" | "teacher";
  email?: string;
  avatar?: string;
  totalQuizzes?: number;
  averageScore?: number;
  improvement?: string | number;
  level?: string;
  badges?: string[];
}
export const DEMO_ACCOUNT_KEY = "disasterready.demoAccounts.v1";
export const DEMO_ACCOUNT_EVENT = "disasterready:accounts";
export type DemoAccounts = {
  version: 1;
  users: DemoUser[];
  currentUsername: string | null;
};
type StorageAccess = Pick<Storage, "getItem" | "setItem">;
const malformed = () =>
  new Error(
    "Local demo-account data is invalid or unsupported. It was not overwritten. Back it up before repairing browser storage.",
  );
const isObject = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === "object" && !Array.isArray(value);
const validName = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0 && value.length <= 80;

function readUser(value: unknown): DemoUser | null {
  if (
    !isObject(value) ||
    !validName(value.username) ||
    (value.role !== "student" && value.role !== "teacher")
  )
    return null;
  const result: DemoUser = { username: value.username, role: value.role };
  for (const key of ["password", "email", "avatar", "level"] as const) {
    if (value[key] !== undefined) {
      if (
        typeof value[key] !== "string" ||
        value[key].length > (key === "avatar" ? 2000000 : 1024)
      )
        return null;
      result[key] = value[key];
    }
  }
  if (value.totalQuizzes !== undefined) {
    if (
      typeof value.totalQuizzes !== "number" ||
      !Number.isSafeInteger(value.totalQuizzes) ||
      value.totalQuizzes < 0
    )
      return null;
    result.totalQuizzes = value.totalQuizzes;
  }
  if (value.averageScore !== undefined) {
    if (
      typeof value.averageScore !== "number" ||
      !Number.isFinite(value.averageScore) ||
      value.averageScore < 0 ||
      value.averageScore > 100
    )
      return null;
    result.averageScore = value.averageScore;
  }
  if (value.improvement !== undefined) {
    if (
      !(
        typeof value.improvement === "number" &&
        Number.isFinite(value.improvement)
      ) &&
      !(typeof value.improvement === "string" && value.improvement.length <= 80)
    )
      return null;
    result.improvement = value.improvement;
  }
  if (value.badges !== undefined) {
    if (
      !Array.isArray(value.badges) ||
      value.badges.length > 100 ||
      !value.badges.every(
        (badge) =>
          typeof badge === "string" && badge.length > 0 && badge.length <= 120,
      )
    )
      return null;
    result.badges = [...value.badges];
  }
  return result;
}

/** Tolerant read-only parser retained for legacy display callers; writes use the strict reader below. */
export function parseDemoUsers(raw: string | null): DemoUser[] {
  try {
    const values: unknown = JSON.parse(raw || "[]");
    return Array.isArray(values)
      ? values.map(readUser).filter((user): user is DemoUser => user !== null)
      : [];
  } catch {
    return [];
  }
}

function strictUsers(value: unknown): DemoUser[] {
  if (!Array.isArray(value)) throw malformed();
  const users = value.map(readUser);
  if (users.some((user) => user === null)) throw malformed();
  const valid = users as DemoUser[];
  if (new Set(valid.map((user) => user.username)).size !== valid.length)
    throw malformed();
  return valid;
}

/** Snapshot strings stay stable for useSyncExternalStore. No read performs a migration/write. */
export function readAccountSnapshot(storage: Pick<Storage, "getItem">): string {
  const current = storage.getItem(DEMO_ACCOUNT_KEY);
  return current !== null
    ? JSON.stringify([current, null, null])
    : JSON.stringify([
        null,
        storage.getItem("users"),
        storage.getItem("currentUser"),
      ]);
}

export function decodeAccountSnapshot(snapshot: string): DemoAccounts {
  try {
    const [current, legacyUsers, legacySession] = JSON.parse(snapshot) as [
      string | null,
      string | null,
      string | null,
    ];
    if (current !== null) {
      const data: unknown = JSON.parse(current);
      if (
        !isObject(data) ||
        data.version !== 1 ||
        !(data.currentUsername === null || validName(data.currentUsername))
      )
        throw malformed();
      const users = strictUsers(data.users);
      if (
        data.currentUsername !== null &&
        !users.some((user) => user.username === data.currentUsername)
      )
        throw malformed();
      return { version: 1, users, currentUsername: data.currentUsername };
    }
    const users = strictUsers(
      legacyUsers === null ? [] : JSON.parse(legacyUsers),
    );
    let selected: DemoUser | null = null;
    try {
      selected = readUser(JSON.parse(legacySession ?? "null"));
    } catch {
      /* Invalid legacy session is signed out, not guessed. */
    }
    const matching =
      selected &&
      users.find(
        (user) =>
          user.username === selected.username && user.role === selected.role,
      );
    return {
      version: 1,
      users,
      currentUsername: matching ? matching.username : null,
    };
  } catch {
    throw malformed();
  }
}

export function currentDemoUser(state: DemoAccounts): DemoUser | null {
  return (
    state.users.find((user) => user.username === state.currentUsername) ?? null
  );
}

function read(storage: StorageAccess) {
  try {
    return decodeAccountSnapshot(readAccountSnapshot(storage));
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.startsWith("Local demo-account")
    )
      throw error;
    throw new Error(
      "Browser storage is unavailable. Demo accounts cannot be loaded.",
    );
  }
}
function commit(storage: StorageAccess, state: DemoAccounts) {
  try {
    storage.setItem(DEMO_ACCOUNT_KEY, JSON.stringify(state));
  } catch {
    throw new Error(
      "Browser storage could not save the change. Keep your draft and check storage space or browser settings.",
    );
  }
  // Same-tab updates do not emit the native storage event.
  if (typeof window !== "undefined")
    window.dispatchEvent(new Event(DEMO_ACCOUNT_EVENT));
}

function credentials(username: string, password: string) {
  const name = username.trim();
  if (!validName(name) || password.length < 1 || password.length > 128)
    throw new Error(
      "Use a name of 1–80 characters and a demo password of 1–128 characters.",
    );
  return name;
}

export function signInDemo(
  storage: StorageAccess,
  username: string,
  password: string,
  teacherOnly = false,
): DemoUser {
  const name = credentials(username, password);
  const state = read(storage);
  // Preserve sign-in for legacy names containing surrounding spaces; new names are trimmed.
  const user =
    state.users.find((item) => item.username === username) ??
    state.users.find((item) => item.username === name);
  if (
    !user ||
    user.password !== password ||
    (teacherOnly && user.role !== "teacher")
  )
    throw new Error(
      teacherOnly
        ? "No matching teacher demo account."
        : "No matching demo username and password.",
    );
  commit(storage, { ...state, currentUsername: user.username });
  return user;
}
export function registerDemo(
  storage: StorageAccess,
  username: string,
  password: string,
  role: DemoUser["role"],
): DemoUser {
  const name = credentials(username, password);
  if (role !== "student" && role !== "teacher")
    throw new Error("Choose a demo student or teacher role.");
  const state = read(storage);
  if (state.users.some((user) => user.username === name))
    throw new Error("That demo username already exists.");
  const user: DemoUser = { username: name, password, role };
  commit(storage, {
    version: 1,
    users: [...state.users, user],
    currentUsername: name,
  });
  return user;
}
export type ProfileChanges = Pick<DemoUser, "username" | "email" | "avatar">;
export function saveDemoProfile(
  storage: StorageAccess,
  expected: DemoUser,
  changes: ProfileChanges,
): DemoUser {
  const username = changes.username.trim();
  const email = changes.email?.trim() ?? "";
  if (!validName(username))
    throw new Error("Username must be 1–80 characters.");
  if (
    email &&
    (email.length > 320 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
  )
    throw new Error("Enter a valid email address or leave it blank.");
  const state = read(storage);
  const user = currentDemoUser(state);
  // Normalize both records so property insertion order is not a stale-edit signal.
  if (!user || JSON.stringify(user) !== JSON.stringify(readUser(expected)))
    throw new Error(
      "The local account changed in another view. Cancel editing and reopen your profile before saving.",
    );
  if (
    changes.avatar &&
    changes.avatar !== user.avatar &&
    !isAvatarData(changes.avatar)
  )
    throw new Error("Choose a supported avatar image before saving.");
  if (
    state.users.some(
      (item) => item.username === username && item.username !== user.username,
    )
  )
    throw new Error("That demo username already exists.");
  const updated = { ...user, username, email, avatar: changes.avatar ?? "" };
  commit(storage, {
    ...state,
    users: state.users.map((item) =>
      item.username === user.username ? updated : item,
    ),
    currentUsername: username,
  });
  return updated;
}
export function signOutDemo(storage: StorageAccess) {
  const state = read(storage);
  commit(storage, { ...state, currentUsername: null });
}
