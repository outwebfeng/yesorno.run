import type { ReactNode } from 'react';
import generateMetadata from './metadata';

export { generateMetadata };
export default function Layout({ children }: { children: ReactNode }) {
  return children;
} 