"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { isAvatarData, readAvatar } from "./avatar";
import { saveDemoProfile, type DemoUser } from "./demoUsers";

export function ProfileEditor({
  user,
  onClose,
}: {
  user: DemoUser;
  onClose: () => void;
}) {
  const [baseline] = useState(user);
  const [username, setUsername] = useState(baseline.username);
  const [email, setEmail] = useState(baseline.email ?? "");
  const [avatar, setAvatar] = useState(baseline.avatar ?? "");
  const [error, setError] = useState("");
  const [loadingImage, setLoadingImage] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const pending = useRef<AbortController | null>(null);
  useEffect(() => {
    const element = dialog.current;
    const opener =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    element?.showModal();
    return () => {
      pending.current?.abort();
      pending.current = null;
      element?.close();
      queueMicrotask(() => {
        if (opener?.isConnected) opener.focus();
      });
    };
  }, []);
  const chooseImage = async (file?: File) => {
    if (!file) return;
    pending.current?.abort();
    const controller = new AbortController();
    pending.current = controller;
    setLoadingImage(true);
    setError("");
    try {
      const value = await readAvatar(file, controller.signal);
      if (!controller.signal.aborted) setAvatar(value);
    } catch (failure) {
      if (!controller.signal.aborted)
        setError(
          failure instanceof Error
            ? failure.message
            : "Unable to load the image.",
        );
    } finally {
      if (pending.current === controller) {
        pending.current = null;
        setLoadingImage(false);
      }
    }
  };
  const save = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (pending.current) return;
    setError("");
    try {
      saveDemoProfile(localStorage, baseline, { username, email, avatar });
      onClose();
    } catch (failure) {
      setError(
        failure instanceof Error
          ? failure.message
          : "Unable to save your profile.",
      );
    }
  };
  const fieldClass =
    "mt-1 w-full rounded-xl border border-slate-300 bg-white p-3 text-slate-900 focus:outline-2 focus:outline-indigo-600";
  return (
    <dialog
      ref={dialog}
      aria-labelledby="edit-profile-title"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      className="m-auto max-h-[90dvh] w-[min(90vw,32rem)] overflow-y-auto rounded-3xl bg-white p-6 text-slate-900 shadow-2xl backdrop:bg-black/60"
    >
      <h2 id="edit-profile-title" className="text-2xl font-bold">
        Edit demo profile
      </h2>
      <p className="my-3 text-sm">
        Saved only in this browser. Use non-sensitive demo details.
      </p>
      {error && (
        <p role="alert" className="mb-4 rounded-xl bg-red-50 p-3 text-red-800">
          {error}
        </p>
      )}
      <form onSubmit={save} className="space-y-4">
        <label className="block font-semibold">
          Username
          <input
            required
            maxLength={80}
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            className={fieldClass}
          />
        </label>
        <label className="block font-semibold">
          Email
          <input
            type="email"
            maxLength={320}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className={fieldClass}
          />
        </label>
        <label className="block font-semibold">
          Avatar image
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            disabled={loadingImage}
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              void chooseImage(file);
            }}
            className="mt-2 block w-full text-sm"
          />
        </label>
        <p className="text-sm">
          PNG, JPEG or WebP; up to 256 KiB and 4096 × 4096 pixels.
        </p>
        {loadingImage && <p role="status">Checking image…</p>}
        {isAvatarData(avatar) ? (
          <Image
            src={avatar}
            width={96}
            height={96}
            unoptimized
            alt="New avatar preview"
            className="h-24 w-24 rounded-full object-cover"
          />
        ) : avatar ? (
          <p className="text-sm">
            The old avatar is unavailable here. Choose a new image or remove it.
          </p>
        ) : null}
        {avatar && (
          <button
            type="button"
            disabled={loadingImage}
            onClick={() => setAvatar("")}
            className="rounded-xl border px-3 py-2"
          >
            Remove avatar
          </button>
        )}
        <div className="flex flex-wrap justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border px-4 py-2"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loadingImage}
            className="rounded-xl bg-indigo-700 px-4 py-2 font-bold text-white disabled:opacity-50"
          >
            Save changes
          </button>
        </div>
      </form>
    </dialog>
  );
}
