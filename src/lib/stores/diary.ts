import { writable } from 'svelte/store';
import type { Entry, Prompt } from '$lib/types';

export const currentEntry = writable<Entry | null>(null);
export const todayPrompt = writable<Prompt | null>(null);
