import { useSyncExternalStore } from 'react';

import { generateDrafts, regenerateDraft } from './engine';
import {
  CATEGORIES,
  defaultConfig,
  MAX_PER_CATEGORY,
  MAX_TOTAL_CHATS,
  totalChats,
  type CategoryCounts,
  type DraftChat,
  type GeneratorConfig,
} from './types';

type Snapshot = {
  version: number;
  config: GeneratorConfig;
  drafts: DraftChat[];
  profileImages: string[];
};

type Listener = () => void;

let config: GeneratorConfig = defaultConfig();
let drafts: DraftChat[] = [];
let profileImages: string[] = [];
let version = 0;
let snapshot: Snapshot = { version, config, drafts, profileImages };
const listeners = new Set<Listener>();

function emit() {
  version += 1;
  snapshot = { version, config, drafts, profileImages };
  listeners.forEach((listener) => listener());
}

export function subscribeGenerator(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getGeneratorSnapshot() {
  return snapshot;
}

export function getGeneratorConfig() {
  return config;
}

export function getDrafts() {
  return drafts;
}

export function getGeneratorVersion() {
  return version;
}

export function setGeneratorConfig(next: Partial<GeneratorConfig>) {
  config = { ...config, ...next, counts: next.counts ? { ...config.counts, ...next.counts } : config.counts };
  emit();
}

export function setCategoryCount(key: keyof GeneratorConfig['counts'], value: number) {
  const next = Math.max(0, Math.min(MAX_PER_CATEGORY, Math.round(value)));
  const others = totalChats(config.counts) - (config.counts[key] ?? 0);
  const capped = Math.min(next, Math.max(0, MAX_TOTAL_CHATS - others));
  config = {
    ...config,
    counts: {
      ...config.counts,
      [key]: capped,
    },
  };
  emit();
}

export function setTotalChats(value: number) {
  const target = Math.max(0, Math.min(MAX_TOTAL_CHATS, Math.round(value)));
  const counts: CategoryCounts = { ...config.counts };
  let diff = target - totalChats(counts);

  if (diff > 0) {
    counts.payment += diff;
  } else {
    for (const key of [...CATEGORIES].reverse()) {
      if (diff >= 0) break;
      const take = Math.min(counts[key], -diff);
      counts[key] -= take;
      diff += take;
    }
  }

  config = { ...config, counts };
  emit();
}

export function generatePreview() {
  drafts = generateDrafts(config, profileImages);
  emit();
  return drafts;
}

export function addProfileImages(uris: string[]) {
  const next = [...profileImages];
  for (const uri of uris) {
    if (!uri || next.includes(uri) || next.length >= MAX_TOTAL_CHATS) continue;
    next.push(uri);
  }
  profileImages = next;
  emit();
}

export function removeProfileImage(uri: string) {
  profileImages = profileImages.filter((item) => item !== uri);
  emit();
}

export function getProfileImages() {
  return profileImages;
}

export function updateDraft(id: string, patch: Partial<DraftChat>) {
  drafts = drafts.map((draft) => (draft.id === id ? { ...draft, ...patch } : draft));
  emit();
}

export function replaceDraft(next: DraftChat) {
  drafts = drafts.map((draft) => (draft.id === next.id ? next : draft));
  emit();
}

export function regenerateOne(id: string) {
  const current = drafts.find((draft) => draft.id === id);
  if (!current) return;
  replaceDraft(regenerateDraft(current, config.style, drafts));
}

export function deleteDraft(id: string) {
  drafts = drafts.filter((draft) => draft.id !== id);
  emit();
}

export function clearDrafts() {
  drafts = [];
  emit();
}

export function getDraft(id: string) {
  return drafts.find((draft) => draft.id === id);
}

export function useGenerator() {
  return useSyncExternalStore(subscribeGenerator, getGeneratorSnapshot, getGeneratorSnapshot);
}
