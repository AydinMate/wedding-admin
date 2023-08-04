import { format } from "date-fns";
import prismadb from "@/lib/prismadb";
import { HireColumn } from "./components/columns";
import { HireClient } from "./components/client";

const HiresPage = async ({ params }: { params: { storeId: string } }) => {
  const hires = await prismadb.productHire.findMany({
    where: {
      storeId: params.storeId,
    },
    include: {
      product: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const formattedHires: HireColumn[] = hires.map((item) => ({
    id: item.id,
    hireDate: format(item.hireDate, 'EEE MMM dd yyyy'),
    product: item.product.name,
    createdAt: format(item.createdAt, "MMM do, yyyy"),
    isPaid: item.isPaid ? "Paid" : "Not Paid"
  }));

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <HireClient data={formattedHires} />
      </div>
    </div>
  );
};

export default HiresPage;
