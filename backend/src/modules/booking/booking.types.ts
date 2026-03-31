export type CreateBookingInput = {
  date: string;
  startTime: string;
  endTime: string;
  serviceType: "RECORDING" | "MIXING" | "MASTERING";
};