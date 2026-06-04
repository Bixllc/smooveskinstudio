export default function InvoicesPage() {
  return (
    <div className="flex flex-col overflow-hidden" style={{ height: "100vh" }}>
      <div className="flex h-[60px] flex-shrink-0 items-center border-b border-black/[0.07] bg-white px-8">
        <h1 className="text-[20px] font-semibold text-[#1b1814]">Invoices</h1>
      </div>
      <div className="flex-1 overflow-y-auto p-8">
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <p className="text-[16px] font-medium text-[#7a756e]">No invoices yet</p>
          <p className="text-[13.5px] text-[#a8a39c]">Get paid by creating and sending an invoice to a client.</p>
        </div>
      </div>
    </div>
  );
}
