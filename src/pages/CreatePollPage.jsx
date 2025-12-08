import LayoutDashboard from "../components/layout/LayoutDashboard";
import CreatePoll from "../components/CreatePoll";

export default function CreatePollPage() {
  return (
    <LayoutDashboard>
      <div className="w-full">
        <CreatePoll />
      </div>
    </LayoutDashboard>
  );
}
