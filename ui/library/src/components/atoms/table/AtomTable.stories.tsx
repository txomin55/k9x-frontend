import { createSignal } from "solid-js";
import { renderSolid } from "@lib/../.storybook/renderSolid";
import AtomTable from "@lib/components/atoms/table/AtomTable";
import type { AtomTableProps } from "@lib/components/atoms/table/AtomTable.types";
import type { ColumnDef } from "@tanstack/solid-table";

type AnimalRow = {
  id: number;
  name: string;
  species: string;
};

const SPECIES = ["Dog", "Cat", "Bird", "Fox", "Horse", "Rabbit"];
const BASE_DATA: AnimalRow[] = Array.from({ length: 120 }, (_, idx) => ({
  id: idx + 1,
  name: `Animal ${idx + 1}`,
  species: SPECIES[idx % SPECIES.length],
}));

const COLUMNS: ColumnDef<AnimalRow>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: (info) => info.getValue(),
  },
  {
    accessorKey: "species",
    header: "Species",
    cell: (info) => info.getValue(),
  },
];

const meta = {
  title: "Atoms/AtomTable",
  render: (args: AtomTableProps<AnimalRow>) =>
    renderSolid(() => <AtomTable<AnimalRow> {...args} />),
};

export default meta;

export const Basic = {
  args: {
    data: BASE_DATA,
    columns: COLUMNS,
  },
};

export const EmptyState = {
  args: {
    data: [],
    columns: COLUMNS,
    emptyMessage: "No animals found.",
  },
};

export const InfiniteScroll = {
  render: () =>
    renderSolid(() => {
      const PAGE_SIZE = 20;
      const [data, setData] = createSignal(BASE_DATA.slice(0, PAGE_SIZE));
      const [isLoadingMore, setIsLoadingMore] = createSignal(false);

      const handleLoadMore = async () => {
        if (isLoadingMore()) return;
        setIsLoadingMore(true);
        await Promise.resolve();
        const current = data();
        const nextItems = BASE_DATA.slice(
          current.length,
          current.length + PAGE_SIZE,
        );
        setData([...current, ...nextItems]);
        setIsLoadingMore(false);
      };

      return (
        <div style={{ height: "560px" }}>
          <AtomTable<AnimalRow>
            columns={COLUMNS}
            data={data()}
            hasMore={data().length < BASE_DATA.length}
            isLoadingMore={isLoadingMore()}
            onLoadMore={handleLoadMore}
          />
        </div>
      );
    }),
};
