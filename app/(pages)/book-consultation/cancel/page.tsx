import Link from "next/link";

export default function CancelPage() {
  return (
    <div className="flex h-screen flex-col items-center justify-center text-center">
      <h1 className="text-3xl font-bold">Payment Cancelled</h1>
      <p className="mt-4">
        You cancelled the payment. Your booking is not confirmed.
      </p>
      <Link href="/book-consultation" className="mt-6 text-blue-600 underline">
        Try again
      </Link>
    </div>
  );
}
