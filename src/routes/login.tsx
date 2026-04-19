import { createFileRoute, redirect } from '@tanstack/react-router';
import { AuthPage } from '@/components/AuthPage';

export const Route = createFileRoute('/login')({
  beforeLoad: ({ context }) => {
    // We don't have access to context unless we passed it from router, but it's fine
    // because AuthPage handles redirecting on auth context internally if needed, or
    // we can just let AuthPage render. But wait, we can't redirect directly here without auth state.
    // Actually AuthPage is a full page UI.
  },
  component: AuthPage,
});
