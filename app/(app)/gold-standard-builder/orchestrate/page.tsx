import {
  DatasetOrchestrator,
} from "@/components/gold-standard-builder/dataset-orchestrator";

export default function GoldStandardDatasetOrchestratorPage() {
  return (
    <main className="mx-auto w-full max-w-[1600px] px-4 py-6 md:px-6 lg:px-8">
      <DatasetOrchestrator />
    </main>
  );
}
