export function LoadingSpinner() {
  return (
    <div className="min-h-screen bg-[#0F1419] flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-2 border-[#5C3FED] border-t-transparent animate-spin" />
    </div>
  );
}
