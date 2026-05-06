import { render } from "@solidjs/testing-library";
import userEvent from "@testing-library/user-event";
import AtomTable from "@lib/components/atoms/table/AtomTable";
import type { ColumnDef } from "@tanstack/solid-table";

type AnimalRow = {
  id: number;
  name: string;
  species: string;
};

const DATA: AnimalRow[] = [
  { id: 1, name: "Rex", species: "Dog" },
  { id: 2, name: "Milo", species: "Cat" },
  { id: 3, name: "Nala", species: "Dog" },
];

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

class IntersectionObserverMock {
  static instances: IntersectionObserverMock[] = [];

  callback: IntersectionObserverCallback;

  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback;
    IntersectionObserverMock.instances.push(this);
  }

  observe() {}

  unobserve() {}

  disconnect() {}

  trigger(isIntersecting: boolean) {
    this.callback([
      { isIntersecting } as IntersectionObserverEntry,
    ], this as unknown as IntersectionObserver);
  }
}

describe("AtomTable", () => {
  beforeEach(() => {
    IntersectionObserverMock.instances = [];
    vi.stubGlobal("IntersectionObserver", IntersectionObserverMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test("renders headers and rows", () => {
    const { getByRole, getByText } = render(() => (
      <AtomTable data={DATA} columns={COLUMNS} />
    ));

    expect(getByRole("columnheader", { name: "Name" })).toBeInTheDocument();
    expect(getByRole("columnheader", { name: "Species" })).toBeInTheDocument();
    expect(getByText("Rex")).toBeInTheDocument();
    expect(getByText("Milo")).toBeInTheDocument();
  });

  test("sorts rows ascending when clicking a sortable header", async () => {
    const user = userEvent.setup();
    const { getByRole, getAllByRole } = render(() => (
      <AtomTable data={DATA} columns={COLUMNS} />
    ));

    const nameSortButton = getByRole("button", { name: "Name" });

    await user.click(nameSortButton);

    const rowsAfterAsc = getAllByRole("row");
    expect(rowsAfterAsc[1]).toHaveTextContent("Milo");
  });

  test("renders empty state", () => {
    const { getByText } = render(() => (
      <AtomTable columns={COLUMNS} data={[]} emptyMessage="No rows yet" />
    ));

    expect(getByText("No rows yet")).toBeInTheDocument();
  });

  test("calls onLoadMore when sentinel intersects and has more data", () => {
    const onLoadMore = vi.fn();

    render(() => (
      <AtomTable
        columns={COLUMNS}
        data={DATA}
        hasMore
        isLoadingMore={false}
        onLoadMore={onLoadMore}
      />
    ));

    const observer = IntersectionObserverMock.instances[0];
    observer.trigger(true);

    expect(onLoadMore).toHaveBeenCalledTimes(1);
  });

  test("does not call onLoadMore when loading or exhausted", () => {
    const onLoadMore = vi.fn();

    render(() => (
      <AtomTable
        columns={COLUMNS}
        data={DATA}
        hasMore
        isLoadingMore
        onLoadMore={onLoadMore}
      />
    ));

    IntersectionObserverMock.instances[0].trigger(true);
    expect(onLoadMore).toHaveBeenCalledTimes(0);

    render(() => (
      <AtomTable
        columns={COLUMNS}
        data={DATA}
        hasMore={false}
        isLoadingMore={false}
        onLoadMore={onLoadMore}
      />
    ));

    IntersectionObserverMock.instances[1].trigger(true);
    expect(onLoadMore).toHaveBeenCalledTimes(0);
  });

  test("calls onSortingChange when sorting changes", async () => {
    const user = userEvent.setup();
    const onSortingChange = vi.fn();

    const { getByRole } = render(() => (
      <AtomTable
        columns={COLUMNS}
        data={DATA}
        onSortingChange={onSortingChange}
      />
    ));

    await user.click(getByRole("button", { name: "Name" }));

    expect(onSortingChange).toHaveBeenCalled();
  });
});
