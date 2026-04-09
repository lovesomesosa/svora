type Status =
  | "RECORDING"
  | "MIXING"
  | "MASTERING"
  | "COMPLETED"
  | "PENDING"
  | "CONFIRMED"
  | "CANCELLED";

type Props = {
  status: Status;
};

const statusStyles: Record<Status, string> = {
  RECORDING: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  MIXING: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  MASTERING: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  COMPLETED: "bg-green-500/20 text-green-400 border-green-500/30",

  PENDING: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  CONFIRMED: "bg-green-500/20 text-green-400 border-green-500/30",
  CANCELLED: "bg-red-500/20 text-red-400 border-red-500/30",
};

export default function StatusBadge({ status }: Props) {
  return (
    <span
      className={`rounded-full border px-2.5 py-1 text-xs font-medium ${statusStyles[status]}`}
    >
      {status}
    </span>
  );
}