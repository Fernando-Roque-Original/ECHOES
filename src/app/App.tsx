import { ArchiveExperience } from './ArchiveExperience';
import { ScrollExperience } from './ScrollExperience';
import { readQueryState } from './queryState';

export default function App() {
  const { mode, world } = readQueryState();

  return mode === 'archive' ? (
    <ArchiveExperience />
  ) : (
    <ScrollExperience initialWorld={world} />
  );
}

