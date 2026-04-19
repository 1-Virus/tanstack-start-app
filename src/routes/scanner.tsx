import { createFileRoute } from '@tanstack/react-router';
import { ScannerPage } from '@/components/ScannerPage';

export const Route = createFileRoute('/scanner')({
  component: ScannerPage,
});
