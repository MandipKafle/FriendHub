import { auth } from "@/lib/auth";
import { getFeed, createPost } from "@/actions/posts";
import { PostCard } from "@/components/PostCard";

export default async function FeedPage() {
  const session = await auth();
  const currentUserId = (session?.user as any)?.id;
  const feedPosts = await getFeed();

  async function handleCreatePost(formData: FormData) {
    "use server";
    const content = formData.get("content") as string;
    await createPost(content);
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Create Post and Feed list */}
      <div className="md:col-span-2">
        <div className="border border-gray-200 bg-white p-4 rounded mb-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">Create Post</h2>
          <form action={handleCreatePost} className="space-y-3">
            <textarea
              name="content"
              rows={3}
              placeholder="What are you working on today?"
              required
              maxLength={500}
              className="w-full rounded border border-gray-200 p-2 text-xs focus:border-black focus:outline-none resize-none font-sans"
            />
            <div className="flex justify-end">
              <button
                type="submit"
                className="rounded border border-black bg-black px-3 py-1.5 text-xs font-semibold text-white hover:bg-zinc-800"
              >
                Post
              </button>
            </div>
          </form>
        </div>

        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">Recent Activity</h2>
          {feedPosts.length === 0 ? (
            <div className="border border-dashed border-gray-200 bg-white py-12 text-center rounded text-xs text-gray-400">
              No posts to show. Add some friends to see their activity.
            </div>
          ) : (
            feedPosts.map((post) => (
              <PostCard key={post.id} post={post} currentUserId={currentUserId} />
            ))
          )}
        </div>
      </div>

      {/* Info Panel / Guidelines */}
      <div className="hidden md:block">
        <div className="border border-gray-200 bg-white p-4 rounded mb-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Welcome</h2>
          <p className="text-xs text-gray-600 leading-relaxed">
            Welcome to <strong>friend-github</strong>! This is your feed. You can see your own posts and posts made by your accepted friends.
          </p>
        </div>

        <div className="border border-gray-200 bg-white p-4 rounded text-xs text-gray-500 leading-normal">
          <h3 className="font-bold text-black mb-1">Network Guidelines</h3>
          <ul className="list-disc pl-4 space-y-1">
            <li>Keep it relevant to development.</li>
            <li>Plain text only.</li>
            <li>Respect other developers.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
