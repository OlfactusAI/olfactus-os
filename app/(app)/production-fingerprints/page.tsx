import {
  FingerprintDashboard,
} from "@/components/production-fingerprints/fingerprint-dashboard";

export default function ProductionFingerprintsPage() {
  return (
    <main className="mx-auto w-full max-w-[1500px] px-4 py-6 md:px-6 lg:px-8">
      <FingerprintDashboard />
    </main>
  );
}
