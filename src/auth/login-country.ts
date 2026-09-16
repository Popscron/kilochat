import { useSyncExternalStore } from 'react';

import { findCountry, GHANA, type Country } from '@/constants/countries';

type Listener = () => void;

let country: Country = GHANA;
const listeners = new Set<Listener>();

function emit() {
  listeners.forEach((listener) => listener());
}

export function subscribeLoginCountry(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getLoginCountry() {
  return country;
}

export function setLoginCountry(next: Country | string) {
  country = typeof next === 'string' ? findCountry(next) : next;
  emit();
}

export function useLoginCountry() {
  return useSyncExternalStore(subscribeLoginCountry, getLoginCountry, getLoginCountry);
}
