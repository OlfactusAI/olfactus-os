import {
  RegistryDetail,
} from "@/components/reference-registry/registry-detail";

export default async function ReferenceRegistryDetailPage({
  params,
}: {
  params:
    Promise<{
      referenceId: string;
    }>;
}) {
  const {
    referenceId,
  } =
    await params;

  return (
    <main className="mx-auto w-full max-w-[1500px] px-4 py-6 md:px-6 lg:px-8">
      <RegistryDetail
        referenceId={
          decodeURIComponent(
            referenceId,
          )
        }
      />
    </main>
  );
}
