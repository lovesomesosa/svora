import Protected from "@/components/Protected";

type ProjectPageProps = {
  params: Promise<{
    id: string;
  }>;
};

const tracks = [
  {
    id: "1",
    title: "Intro",
    order: 1,
    versions: 2,
    comments: 3,
  },
  {
    id: "2",
    title: "Main Theme",
    order: 2,
    versions: 4,
    comments: 6,
  },
];

export default async function ProjectDetailsPage({
  params,
}: ProjectPageProps) {
  const { id } = await params;

  return (
    <Protected>
        <section className="space-y-8">
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
        <p className="text-sm text-neutral-500">Project ID: {id}</p>
        <h1 className="mt-2 text-3xl font-semibold">Project Details</h1>
        <p className="mt-2 text-neutral-400">
          Здесь будет полная информация о проекте, статусе и составе треков.
        </p>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Tracks</h2>

        {tracks.map((track) => (
          <div
            key={track.id}
            className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-medium">
                  {track.order}. {track.title}
                </h3>
                <p className="mt-1 text-sm text-neutral-400">
                  Versions: {track.versions} • Comments: {track.comments}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
    </Protected>
  );
}