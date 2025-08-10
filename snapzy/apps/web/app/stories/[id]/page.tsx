export default function StoryPage({ params }: { params: { id: string } }) {
  return (
    <main className="p-6">
      <h1 className="text-xl font-semibold">Story {params.id}</h1>
    </main>
  );
}