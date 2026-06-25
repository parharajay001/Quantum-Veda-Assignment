import { getTasks, getUsers } from "@/lib/tasks.server";
import { BoardView } from "@/components/board/board-view";

export default async function DashboardPage() {
  const [tasks, users] = await Promise.all([getTasks(), getUsers()]);

  return <BoardView initialTasks={tasks} users={users} />;
}
