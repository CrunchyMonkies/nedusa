import { HttpTypes } from "@nedusa/types";
import { createDataTableFilterHelper } from "@nedusa/ui";
import { useMemo } from "react";
import { useDataTableDateFilters } from "../general/use-data-table-date-filters";

const filterHelper = createDataTableFilterHelper<HttpTypes.AdminSalesChannel>();

export const useSalesChannelTableFilters = () => {
  const dateFilters = useDataTableDateFilters();

  return useMemo(
    () => [
      filterHelper.accessor("is_disabled", {
        label: "Status",
        type: "radio",
        options: [
          {
            label: "Enabled",
            value: "false",
          },
          {
            label: "Disabled",
            value: "true",
          },
        ],
      }),
      ...dateFilters,
    ],
    [dateFilters]
  );
};
