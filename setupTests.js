// setupTests.js (ROOT)
import '@testing-library/jest-dom';
import 'whatwg-fetch';
import React from 'react';
import { vi } from 'vitest';

// Mock Next (tanpa JSX)
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), back: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }),
  usePathname: () => '/dashboard/complaint',
}));

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }) =>
    React.createElement('a', { href, ...props }, children),
}));

vi.mock('next/image', () => ({
  __esModule: true,
  default: (props) =>
    React.createElement('img', { ...props, alt: props?.alt || '' }),
}));
